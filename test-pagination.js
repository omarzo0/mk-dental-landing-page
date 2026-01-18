
async function tested() {
    const baseUrl = "http://localhost:3000";

    try {
        // 1. Get categories to find a valid subcategory
        console.log("Fetching categories...");
        const res1 = await fetch(`${baseUrl}/api/user/categories`);
        const data1 = await res1.json();

        let subName = null;
        if (data1.success) {
            const cats = Array.isArray(data1.data) ? data1.data : (data1.data.categories || []);
            for (const cat of cats) {
                if (cat.subcategories && cat.subcategories.length > 0) {
                    const s = cat.subcategories[0];
                    subName = typeof s === 'string' ? s : s.name;
                    break;
                }
            }
        }

        if (!subName) {
            console.log("No subcategory found in categories. Using fallback 'Diagnostic'.");
            subName = "Diagnostic";
        } else {
            console.log(`Found valid subcategory: ${subName}`);
        }

        // 2. Test filtering by subcategory with limit
        console.log(`Testing filtering by subcategory="${subName}" with limit=5...`);
        const res2 = await fetch(`${baseUrl}/api/user/products?productType=single&subcategory=${encodeURIComponent(subName)}&limit=5`);
        const data2 = await res2.json();

        if (data2.success) {
            const list = Array.isArray(data2.data) ? data2.data : (data2.data.products || []);
            console.log(`Received count: ${list.length}`);

            if (list.length > 5) {
                console.log("FAIL: Received more than 5 items.");
            } else {
                console.log("PASS: Received count <= 5.");
            }

            // Check if items actually match the subcategory
            const allMatch = list.every(p => {
                const s = typeof p.subcategory === 'object' ? p.subcategory.name : p.subcategory;
                return s && s.toLowerCase().trim() === subName.toLowerCase().trim();
            });

            if (list.length > 0 && allMatch) {
                console.log("PASS: All items match the requested subcategory.");
            } else if (list.length > 0) {
                console.log("FAIL: Some items do NOT match the subcategory.");
            } else {
                console.log("WARN: No items returned for this subcategory.");
            }

        } else {
            console.log("API Error:", data2.error);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

tested();
