"""
Dataset Generator — creates realistic Zepto e-commerce inventory dataset (3,700 SKUs).
Generates zepto_v2.csv with all authentic columns, categories, pricing, weights, and stock levels.
"""

import random
from pathlib import Path
import pandas as pd

CATEGORIES = {
    "Fruits & Vegetables": [
        ("Fresh Banana Robusta", 4000, 500, "500 g"),
        ("Onion / Pyaz", 3500, 1000, "1 kg"),
        ("Potato / Aloo", 3000, 1000, "1 kg"),
        ("Tomato Hybrid", 2500, 500, "500 g"),
        ("Fresh Lemon / Nimbu", 1500, 200, "200 g"),
        ("Coriander Leaves / Dhaniya", 1000, 100, "100 g"),
        ("Green Chillies / Hari Mirch", 1200, 100, "100 g"),
        ("Ginger / Adrak", 2000, 200, "200 g"),
        ("Garlic / Lahsun", 2500, 200, "200 g"),
        ("Royal Gala Apple", 18000, 400, "4 pcs"),
        ("Pomegranate / Anar", 14000, 500, "500 g"),
        ("Papaya Semi Ripe", 6000, 1000, "1 kg"),
    ],
    "Dairy, Bread & Eggs": [
        ("Amul Taaza T-Special Milk", 2700, 500, "500 ml"),
        ("Amul Gold Full Cream Milk", 3300, 500, "500 ml"),
        ("Amul Salted Butter", 27500, 500, "500 g"),
        ("Mother Dairy Fresh Paneer", 12000, 200, "200 g"),
        ("Amul Masti Curd", 3500, 400, "400 g"),
        ("Britannia 100% Whole Wheat Bread", 5000, 400, "400 g"),
        ("Farm Fresh White Eggs", 8500, 350, "6 pcs"),
        ("Nestle Milkmaid Sweetened Milk", 14000, 380, "380 g"),
        ("Amul Cheese Slices", 16500, 200, "200 g"),
    ],
    "Munchies & Snacks": [
        ("Lay's Magic Masala Potato Chips", 2000, 50, "50 g"),
        ("Kurkure Masala Munch", 2000, 90, "90 g"),
        ("Haldiram's Bhujia Sev", 11000, 350, "350 g"),
        ("Doritos Nacho Cheese Chips", 5000, 82, "82 g"),
        ("Pringles Original Potato Crisps", 11500, 107, "107 g"),
        ("Haldiram's Aloo Bhujia", 5500, 150, "150 g"),
        ("Bingo Mad Angles Cheese Nachos", 2000, 60, "60 g"),
    ],
    "Cold Drinks & Juices": [
        ("Coca-Cola Soft Drink", 4000, 750, "750 ml"),
        ("Thums Up Soft Drink", 4000, 750, "750 ml"),
        ("Sprite Lemon-Lime Drink", 4000, 750, "750 ml"),
        ("Real Fruit Power Mixed Fruit Juice", 13000, 1000, "1 L"),
        ("Red Bull Energy Drink", 12500, 250, "250 ml"),
        ("Paper Boat Tender Coconut Water", 6000, 200, "200 ml"),
        ("Maaza Mango Drink", 4500, 1200, "1.2 L"),
    ],
    "Biscuits & Bakery": [
        ("Parle-G Gold Biscuits", 1000, 100, "100 g"),
        ("Britannia Good Day Cashew Biscuits", 3000, 200, "200 g"),
        ("Oreo Dark Jumbo Cream Biscuits", 4000, 120, "120 g"),
        ("Sunfeast Dark Fantasy Choco Fills", 6000, 150, "150 g"),
        ("Britannia Bourbon Chocolate Biscuits", 3000, 150, "150 g"),
        ("Parle Hide & Seek Chocolate Chip", 3500, 120, "120 g"),
    ],
    "Breakfast & Instant Food": [
        ("Maggi 2-Minute Masala Noodles", 1400, 70, "70 g"),
        ("Quaker Oats Whole Grain", 19000, 1000, "1 kg"),
        ("Kellogg's Corn Flakes", 18500, 475, "475 g"),
        ("Yuppee Masala Instant Noodles", 1200, 60, "60 g"),
        ("Saffola Masala Oats Classic", 4500, 180, "180 g"),
        ("MTR Instant Rava Idli Mix", 8000, 500, "500 g"),
    ],
    "Sweet Tooth": [
        ("Cadbury Dairy Milk Silk Chocolate", 17500, 150, "150 g"),
        ("Ferrero Rocher Chocolate Box", 54900, 200, "16 pcs"),
        ("KitKat 4 Finger Chocolate", 4000, 38, "38 g"),
        ("Amul Choco Zoo Chocolates", 2000, 50, "50 g"),
        ("Baskin Robbins Ice Cream Tub", 35000, 450, "450 ml"),
        ("Haldiram's Gulab Jamun Tin", 22000, 1000, "1 kg"),
    ],
    "Tea, Coffee & Health Drinks": [
        ("Tata Tea Premium Leaf Tea", 25000, 500, "500 g"),
        ("Nescafe Classic Instant Coffee", 32000, 100, "100 g"),
        ("Bournvita Chocolate Health Drink", 26000, 500, "500 g"),
        ("Society Masala Tea", 16000, 250, "250 g"),
        ("Bru Instant Coffee Powder", 18000, 100, "100 g"),
    ],
    "Bath & Personal Care": [
        ("Dettol Original Bathing Soap", 16000, 375, "3 x 125 g"),
        ("Dove Cream Beauty Bathing Bar", 19500, 375, "3 x 125 g"),
        ("Head & Shoulders Anti-Dandruff Shampoo", 34000, 340, "340 ml"),
        ("Colgate Strong Teeth Toothpaste", 12000, 200, "200 g"),
        ("Nivea Soft Light Moisturizing Cream", 22000, 200, "200 ml"),
    ],
    "Cleaning & Household": [
        ("Vim Dishwash Liquid Gel", 11500, 500, "500 ml"),
        ("Surf Excel Easy Wash Detergent Powder", 21000, 1000, "1 kg"),
        ("Colin Glass & Surface Cleaner", 11000, 500, "500 ml"),
        ("Harpic Disinfectant Bathroom Cleaner", 18500, 1000, "1 L"),
        ("Ariel Matic Front Load Detergent", 35000, 1000, "1 kg"),
    ],
    "Paan Corner": [
        ("Pass Pass Sweet Mint Mouth Freshener", 1000, 20, "20 g"),
        ("Center Fresh Chewing Gum", 500, 10, "10 g"),
        ("Rajnigandha Silver Coated Elaichi", 10000, 10, "10 g"),
        ("Tic Tac Mint Mouth Freshener", 2000, 14, "14 g"),
    ],
}

VARIANTS = ["Pack of 1", "Pack of 2", "Family Pack", "Value Pack", "Combo Pack", "Promo Size", "Super Saver"]


def generate_zepto_csv(total_rows: int = 3700):
    rows = []
    cat_list = list(CATEGORIES.keys())
    
    sku_id = 1
    while len(rows) < total_rows:
        cat = random.choice(cat_list)
        base_item = random.choice(CATEGORIES[cat])
        base_name, base_mrp, base_weight, base_qty = base_item
        
        variant = random.choice(VARIANTS)
        mult = random.choice([1, 1, 1, 2, 3])
        
        name = f"{base_name} - {variant}" if mult > 1 else base_name
        mrp = base_mrp * mult + random.choice([0, 500, 1000, -200])
        if mrp <= 500:
            mrp = base_mrp
            
        discount = random.choice([0, 0, 5, 10, 12, 15, 20, 25, 30, 40])
        selling_price = int(mrp * (1 - discount / 100.0))
        weight = base_weight * mult
        qty_desc = f"{mult} x {base_qty}" if mult > 1 else base_qty
        
        avail_qty = random.choices([0, random.randint(1, 5), random.randint(6, 30), random.randint(31, 150)], weights=[15, 15, 50, 20])[0]
        out_of_stock = "TRUE" if avail_qty == 0 else "FALSE"
        
        rows.append({
            "sku_id": sku_id,
            "category": cat,
            "name": name,
            "mrp": mrp,
            "discountPercent": discount,
            "discountedSellingPrice": selling_price,
            "availableQuantity": avail_qty,
            "weightInGms": weight,
            "outOfStock": out_of_stock,
            "quantity": qty_desc,
        })
        sku_id += 1
        
    df = pd.DataFrame(rows)
    output_path = Path(__file__).resolve().parent.parent.parent / "data" / "zepto_v2.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} SKUs at {output_path}")


if __name__ == "__main__":
    generate_zepto_csv(3700)
