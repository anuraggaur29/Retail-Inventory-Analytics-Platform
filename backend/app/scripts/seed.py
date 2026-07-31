"""
Database seed script — loads the Zepto CSV dataset into normalized tables.

WHAT THIS SCRIPT DOES:
1. Reads the raw CSV (flat file with repeated category strings)
2. Extracts unique categories → inserts into categories table
3. Generates SKU codes for each product
4. Converts prices from paise to rupees
5. Inserts products with proper foreign keys to categories
6. Creates inventory records for each product
7. Generates initial price history records
8. Creates default users with 4 roles

WHY A SEED SCRIPT (not SQL INSERT statements)?
- Python gives us pandas for data cleaning (handle encoding, NaN, duplicates)
- We can generate SKUs, slugs, and computed fields programmatically
- Easier to maintain and re-run than raw SQL
- Can handle the paise→rupees conversion cleanly

INTERVIEW TALKING POINT:
"The seed script normalizes a flat CSV into 5 related tables. It extracts
unique categories, generates SKU codes, converts paise to rupees using integer
arithmetic for precision, and creates inventory records — all with proper
foreign key relationships. This demonstrates ETL (Extract, Transform, Load)
principles."

USAGE:
    cd backend
    python -m app.scripts.seed
"""

import sys
import os
import re
from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

# Add backend to path so we can import app modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.core.database import SessionLocal, engine
from app.models import Base, Role, User, Category, Product, Inventory, PriceHistory
from app.core.security import hash_password


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug. e.g. 'Fruits & Vegetables' → 'fruits-vegetables'"""
    text = text.lower().strip()
    text = re.sub(r"[&]+", "and", text)
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def generate_sku(category_slug: str, index: int) -> str:
    """Generate a SKU like 'FRU-00001' from category slug and index."""
    prefix = category_slug[:3].upper()
    return f"{prefix}-{index:05d}"


def seed_roles(db: Session) -> dict[str, Role]:
    """Create the 4 RBAC roles."""
    print("  Seeding roles...")
    roles_data = [
        {"name": "admin", "description": "Full system access"},
        {"name": "manager", "description": "Manage inventory and products"},
        {"name": "analyst", "description": "View analytics and reports"},
        {"name": "viewer", "description": "Read-only access"},
    ]
    roles = {}
    for data in roles_data:
        role = db.query(Role).filter(Role.name == data["name"]).first()
        if not role:
            role = Role(**data)
            db.add(role)
        roles[data["name"]] = role
    db.flush()
    print(f"    [OK] {len(roles)} roles created")
    return roles


def seed_users(db: Session, roles: dict[str, Role]) -> None:
    """Create default users for each role."""
    print("  Seeding users...")
    users_data = [
        {
            "email": "admin@stockpulse.io",
            "full_name": "Admin User",
            "password": "admin123",
            "role": "admin",
        },
        {
            "email": "manager@stockpulse.io",
            "full_name": "Store Manager",
            "password": "manager123",
            "role": "manager",
        },
        {
            "email": "analyst@stockpulse.io",
            "full_name": "Data Analyst",
            "password": "analyst123",
            "role": "analyst",
        },
        {
            "email": "viewer@stockpulse.io",
            "full_name": "Viewer User",
            "password": "viewer123",
            "role": "viewer",
        },
    ]
    count = 0
    for data in users_data:
        existing = db.query(User).filter(User.email == data["email"]).first()
        if not existing:
            user = User(
                email=data["email"],
                full_name=data["full_name"],
                hashed_password=hash_password(data["password"]),
                role_id=roles[data["role"]].id,
            )
            db.add(user)
            count += 1
    db.flush()
    print(f"    [OK] {count} users created")


def seed_categories(db: Session, df: pd.DataFrame) -> dict[str, Category]:
    """Extract unique categories from CSV and insert into categories table."""
    print("  Seeding categories...")
    unique_categories = df["category"].dropna().unique()
    categories = {}

    for cat_name in sorted(unique_categories):
        cat_name = cat_name.strip()
        if not cat_name:
            continue
        existing = db.query(Category).filter(Category.name == cat_name).first()
        if not existing:
            category = Category(
                name=cat_name,
                slug=slugify(cat_name),
            )
            db.add(category)
            categories[cat_name] = category
        else:
            categories[cat_name] = existing

    db.flush()
    print(f"    [OK] {len(categories)} categories created")
    return categories


def seed_products_and_inventory(
    db: Session,
    df: pd.DataFrame,
    categories: dict[str, Category],
) -> None:
    """
    Transform CSV rows into products and inventory records.

    Data transformations:
    - mrp: paise → rupees (divide by 100)
    - selling_price: paise → rupees
    - discount_percent: keep as-is
    - weight: keep as-is (grams)
    - out_of_stock: string/bool → boolean
    """
    print("  Seeding products and inventory...")
    sku_counter = {}
    products_created = 0
    skipped = 0

    for _, row in df.iterrows():
        # Skip rows with missing essential data
        category_name = str(row.get("category", "")).strip()
        product_name = str(row.get("name", "")).strip()

        if not category_name or not product_name:
            skipped += 1
            continue
        if category_name not in categories:
            skipped += 1
            continue

        category = categories[category_name]

        # Convert prices from paise to rupees
        mrp_paise = int(row.get("mrp", 0) or 0)
        mrp_rupees = round(mrp_paise / 100, 2)

        selling_price_paise = int(row.get("discountedsellingprice", 0) or 0)
        selling_price_rupees = round(selling_price_paise / 100, 2)

        # Skip invalid prices
        if mrp_rupees <= 0:
            skipped += 1
            continue

        discount_percent = float(row.get("discountpercent", 0) or 0)

        # Generate unique SKU
        cat_slug = category.slug
        sku_counter[cat_slug] = sku_counter.get(cat_slug, 0) + 1
        sku = generate_sku(cat_slug, sku_counter[cat_slug])

        # Parse weight
        weight_gms = None
        raw_weight = row.get("weightingms")
        if pd.notna(raw_weight):
            try:
                weight_gms = int(float(raw_weight))
            except (ValueError, TypeError):
                pass

        # Parse quantity description
        quantity_desc = None
        raw_qty = row.get("quantity")
        if pd.notna(raw_qty):
            quantity_desc = str(raw_qty).strip()

        # Parse out_of_stock
        raw_oos = row.get("outofstock", False)
        if isinstance(raw_oos, str):
            is_oos = raw_oos.strip().lower() in ("true", "1", "yes")
        else:
            is_oos = bool(raw_oos)

        available_qty = int(row.get("availablequantity", 0) or 0)
        # If quantity is 0 or marked out of stock
        if available_qty == 0:
            is_oos = True

        # Create product
        product = Product(
            sku=sku,
            name=product_name,
            category_id=category.id,
            mrp_paise=mrp_paise,
            mrp=mrp_rupees,
            discount_percent=discount_percent,
            selling_price=selling_price_rupees if selling_price_rupees > 0 else mrp_rupees,
            weight_gms=weight_gms,
            quantity_desc=quantity_desc,
        )
        db.add(product)
        db.flush()  # Get the product.id

        # Create inventory record (1:1 with product)
        inventory = Inventory(
            product_id=product.id,
            available_quantity=available_qty,
            reorder_level=10,
            is_out_of_stock=is_oos,
        )
        db.add(inventory)

        # Create initial price history record
        price_record = PriceHistory(
            product_id=product.id,
            old_mrp=None,
            old_discount_percent=None,
            old_selling_price=None,
            new_mrp=mrp_rupees,
            new_discount_percent=discount_percent,
            new_selling_price=selling_price_rupees if selling_price_rupees > 0 else mrp_rupees,
            change_reason="Initial catalog load",
        )
        db.add(price_record)

        products_created += 1

        # Batch flush every 500 rows
        if products_created % 500 == 0:
            db.flush()
            print(f"    ... {products_created} products processed")

    db.flush()
    print(f"    [OK] {products_created} products created ({skipped} skipped)")


def run_seed():
    """Main seed function."""
    print("\n" + "=" * 60)
    print("  StockPulse Database Seeder")
    print("=" * 60)

    # Find CSV file
    csv_path = Path(__file__).resolve().parent.parent.parent / "data" / "zepto_v2.csv"
    if not csv_path.exists():
        print(f"\n  [ERROR] CSV file not found at: {csv_path}")
        print("  Download from: https://www.kaggle.com/datasets/palvinder2006/zepto-inventory-dataset")
        print(f"  Place it at: {csv_path}")
        sys.exit(1)

    # Read CSV
    print(f"\n  Reading CSV from: {csv_path}")
    df = pd.read_csv(csv_path, encoding="utf-8")
    print(f"    [OK] {len(df)} rows loaded")

    # Normalize column names to lowercase
    df.columns = [col.lower().strip() for col in df.columns]
    print(f"    Columns: {list(df.columns)}")

    # Create tables if they don't exist (for first run before alembic)
    print("\n  Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("    [OK] Tables created")

    # Seed data
    db = SessionLocal()
    try:
        roles = seed_roles(db)
        seed_users(db, roles)
        categories = seed_categories(db, df)
        seed_products_and_inventory(db, df, categories)

        db.commit()
        print("\n  [SUCCESS] Database seeded successfully!")
        print("=" * 60)

        # Print summary
        print(f"\n  Summary:")
        print(f"    Roles:      {db.query(Role).count()}")
        print(f"    Users:      {db.query(User).count()}")
        print(f"    Categories: {db.query(Category).count()}")
        print(f"    Products:   {db.query(Product).count()}")
        print(f"    Inventory:  {db.query(Inventory).count()}")
        print(f"    Price Hist: {db.query(PriceHistory).count()}")
        print()

    except Exception as e:
        db.rollback()
        print(f"\n  [ERROR] Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
