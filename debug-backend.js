
async function checkBackend() {
    try {
        const url = 'http://localhost:5000/api/products?limit=5';
        console.log(`Fetching from: ${url}`);
        const response = await fetch(url);

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log(`Raw Body Length: ${text.length}`);

        if (!text) {
            console.error("Empty response body!");
            return;
        }

        try {
            const data = JSON.parse(text);
            console.log('Success:', data.success);

            if (data.data?.products && Array.isArray(data.data.products)) {
                console.log('Products found:', data.data.products.length);
                data.data.products.forEach((p, i) => {
                    console.log(`[${i}] Name: ${p.name}`);
                    console.log(`    Category:`, JSON.stringify(p.category, null, 2));
                    console.log(`    Subcategory:`, JSON.stringify(p.subcategory, null, 2));
                    console.log('---');
                });
            }
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            console.log("Raw Body Preview:", text.substring(0, 500));
        }

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

checkBackend();
