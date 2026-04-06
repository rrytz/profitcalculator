/* WinFind v4 - Advanced E-Com Intelligence Logic */

const products = {
    beauty: { name: "Electric Facial Cleansing Brush", cost: 4.25, price: 24.99, trend: "trending", platform: "Amazon", buy_url: "https://www.amazon.com/s?k=electric+facial+cleansing+brush", image_url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=800&auto=format&fit=crop&v=4", plan: "1. Brand as luxury item. 2. Launch TikTok ads. 3. Bundle with face wash for higher AOV." },
    fitness: { name: "Portable Pilates Bar Kit", cost: 11.50, price: 39.99, trend: "trending", platform: "Shopee", buy_url: "https://shopee.com/search?keyword=pilates+bar+kit", image_url: "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?q=80&w=800&auto=format&fit=crop&v=4", plan: "1. Target home-workouts. 2. Daily reels for social proof. 3. Upsell with a digital 30-day guide." },
    home: { name: "Magnetic Motion Sensor Lights", cost: 3.20, price: 19.95, trend: "stable", platform: "Lazada", buy_url: "https://www.lazada.com.ph/tag/magnetic-sensor-light/", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop&v=4", plan: "1. Marketing: 'Smart home in 5s'. 2. Sell in multi-packs for volume. 3. Pinterest ads for styling." },
    tech: { name: "Foldable 3-in-1 Wireless Charger", cost: 13.80, price: 49.00, trend: "trending", platform: "Amazon", buy_url: "https://www.amazon.com/s?k=3+in+1+wireless+charger+foldable", image_url: "https://images.unsplash.com/photo-1586953101559-4adca62362de?q=80&w=800&auto=format&fit=crop&v=4", plan: "1. Target digital nomads & techies. 2. High-quality unboxing content. 3. Google Search ads for travel." },
    pets: { name: "Self-Cleaning Slicker Brush", cost: 2.10, price: 18.50, trend: "stable", platform: "Shopee", buy_url: "https://shopee.com/search?keyword=self+cleaning+pet+brush", image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop&v=4", plan: "1. Highlight 'One-Click' utility. 2. Partner with pet influencers. 3. Facebook ads for cat/dog owners." },
    kids: { name: "Reusable Water Coloring Book", cost: 1.50, price: 14.99, trend: "stable", platform: "Lazada", buy_url: "https://www.lazada.com.ph/tag/water-coloring-book/", image_url: "https://images.unsplash.com/photo-1560421683-6856ea585c78?q=80&w=800&auto=format&fit=crop&v=4", plan: "1. Focus on 'Mess-Free' travel. 2. Amazon PPC for travel games. 3. Target parents of toddlers." },
    food: { name: "Portable Electric Milk Frother", cost: 2.50, price: 15.00, trend: "saturated", platform: "Other", buy_url: "https://www.google.com/search?q=electric+milk+frother&tbm=shop", image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop&v=4", plan: "1. Appeal to 'Coffee at Home'. 2. Create latte-art shorts. 3. Kitchen gadget bundles and gifting." }
};

// --- CORE DATA & PERSISTENCE ---
let savedProducts = JSON.parse(localStorage.getItem('winfind_v4_saved')) || [];
let salesHistory = JSON.parse(localStorage.getItem('winfind_v4_history')) || [];
let currentTarget = parseFloat(localStorage.getItem('winfind_v4_target')) || 0;
let currentRecommendation = null;

const syncStorage = () => {
    localStorage.setItem('winfind_v4_saved', JSON.stringify(savedProducts));
    localStorage.setItem('winfind_v4_history', JSON.stringify(salesHistory));
    localStorage.setItem('winfind_v4_target', currentTarget.toString());
};

// --- NAVIGATION ---
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.dataset.tab;
        document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(targetTab).classList.add('active');
        
        if (targetTab === 'tab-compare') renderComparison();
        if (targetTab === 'tab-tracker') updateTrackerUI();
    });
});

// --- HELPER FUNCTIONS ---
const renderProductCard = (p) => `<div class="product-card">
    <img src="${p.image_url}" alt="${p.name}" loading="lazy" referrerpolicy="no-referrer" />
    <div class="product-info">
      <h3>${p.name}<span class="trend-badge trend-${p.trend}">${p.trend}</span></h3>
      <p>Cost: $${p.cost.toFixed(2)} · Sell: $${p.price.toFixed(2)}</p>
      <a href="${p.buy_url}" target="_blank" rel="noopener" class="btn-primary" style="padding: 10px; font-size: 0.8rem;">Buy on ${p.platform} →</a>
    </div>
  </div>`;

const renderSourcingCard = (productName) => {
    const alibaba = `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(productName)}`;
    const aliexpress = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(productName)}`;
    const google = `https://www.google.com/search?q=${encodeURIComponent(productName)}+supplier+wholesale&tbm=shop`;

    return `<div class="sourcing-card">
        <div class="sourcing-title">📦 Sourcing & Logistics</div>
        <div class="sourcing-links">
            <a href="${alibaba}" target="_blank" class="source-btn">Alibaba (Wholesale)</a>
            <a href="${aliexpress}" target="_blank" class="source-btn">AliExpress (Samples)</a>
            <a href="${google}" target="_blank" class="source-btn" style="grid-column: 1 / -1;">Search Other Suppliers</a>
        </div>
    </div>`;
};

// --- CALCULATOR & BREAK-EVEN ---
document.getElementById('calculator-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const targetProfit = parseFloat(document.getElementById('targetProfit').value);
    const adSpend = parseFloat(document.getElementById('adSpend').value) || 0;
    const shipping = parseFloat(document.getElementById('shippingCost').value) || 0;
    const nicheKey = document.getElementById('niche').value;

    const product = products[nicheKey];
    currentTarget = targetProfit;
    
    // ADVANCED MATH
    const netProfitPerUnit = product.price - product.cost - shipping;
    const unitsNeeded = Math.ceil((targetProfit + adSpend) / netProfitPerUnit);
    const totalRevenue = unitsNeeded * product.price;
    const netMargin = ((netProfitPerUnit / product.price) * 100).toFixed(1);

    currentRecommendation = { ...product, unitsNeeded, netProfitPerUnit, targetProfit, adSpend, shipping, netMargin };
    syncStorage();

    // RENDER UI
    document.getElementById('card-container').innerHTML = renderProductCard(product);
    document.getElementById('sourcing-container').innerHTML = renderSourcingCard(product.name);
    
    document.getElementById('netProfitPerUnit').innerText = `$${netProfitPerUnit.toFixed(2)}`;
    document.getElementById('unitsNeeded').innerText = unitsNeeded.toLocaleString();
    document.getElementById('totalRevenue').innerText = `$${totalRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
    document.getElementById('netMargin').innerText = `${netMargin}%`;
    
    document.getElementById('planText').innerHTML = `
        <p>${product.plan}</p>
        <p style="margin-top: 1rem;"><strong>Success Metric:</strong> To hit $${targetProfit.toLocaleString()} profit after spending $${adSpend} on ads, you must sell <strong>${unitsNeeded} units</strong> at $${product.price}.</p>
    `;

    document.getElementById('results').style.display = 'block';
    document.getElementById('post-calculate-actions').style.display = 'block';
    
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
});

// --- PDF EXPORT ---
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    if (!currentRecommendation) return;
    const r = currentRecommendation;

    // Build a clean, light-themed report in a hidden container
    const reportHTML = `
      <div style="font-family: 'Inter', Arial, sans-serif; color: #111; background: #fff; padding: 40px; max-width: 700px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 32px; margin: 0;">Win<span style="color: #00c47d;">Find</span></h1>
          <p style="color: #888; font-size: 14px; margin-top: 5px;">Product Strategy Report</p>
          <hr style="border: none; border-top: 2px solid #eee; margin-top: 20px;">
        </div>

        <h2 style="font-size: 22px; color: #111; margin-bottom: 5px;">${r.name}</h2>
        <span style="font-size: 12px; background: ${r.trend === 'trending' ? '#d1fae5' : r.trend === 'stable' ? '#dbeafe' : '#fee2e2'}; color: ${r.trend === 'trending' ? '#065f46' : r.trend === 'stable' ? '#1e40af' : '#991b1b'}; padding: 3px 10px; border-radius: 20px; font-weight: 700; text-transform: uppercase;">${r.trend}</span>

        <table style="width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 14px;">
          <tr style="background: #f9fafb;">
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 700;">Product Cost</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">$${r.cost.toFixed(2)}</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 700;">Selling Price</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">$${r.price.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 700;">Net Profit / Unit</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; color: #059669; font-weight: 700;">$${r.netProfitPerUnit.toFixed(2)}</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 700;">Net Margin</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; color: #059669; font-weight: 700;">${r.netMargin}%</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 700;">Monthly Ad Spend</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">$${(r.adSpend || 0).toLocaleString()}</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 700;">Shipping / Unit</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">$${(r.shipping || 0).toFixed(2)}</td>
          </tr>
        </table>

        <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 20px; border-radius: 8px; margin-top: 25px;">
          <p style="font-size: 16px; font-weight: 800; color: #065f46; margin: 0;">
            Target: Sell ${r.unitsNeeded} units to earn $${r.targetProfit.toLocaleString()}/month
          </p>
        </div>

        <h3 style="margin-top: 30px; font-size: 16px; color: #374151;">📦 Where to Source</h3>
        <ul style="font-size: 13px; color: #555; line-height: 2; padding-left: 20px;">
          <li><strong>Alibaba</strong> — alibaba.com (Wholesale / Bulk)</li>
          <li><strong>AliExpress</strong> — aliexpress.com (Samples / Dropship)</li>
          <li><strong>Google Shopping</strong> — Compare retail prices</li>
        </ul>

        <h3 style="margin-top: 25px; font-size: 16px; color: #374151;">🚀 Action Plan</h3>
        <p style="font-size: 13px; color: #555; line-height: 1.8;">${r.plan}</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px;">
        <p style="text-align: center; font-size: 11px; color: #aaa; margin-top: 15px;">
          Generated by WinFind · ${new Date().toLocaleDateString()} · All calculations are estimates.
        </p>
      </div>
    `;

    // Create a temporary hidden container
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.innerHTML = reportHTML;
    document.body.appendChild(tempDiv);

    const opt = {
        margin: 0.25,
        filename: `WinFind_Report_${r.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff', scrollY: 0 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(tempDiv.firstElementChild).save().then(() => {
        document.body.removeChild(tempDiv);
    }).catch(err => {
        console.error("PDF Export failed:", err);
        document.body.removeChild(tempDiv);
    });
});


// --- SAVE & COMPARE ---
document.getElementById('saveProductBtn').addEventListener('click', () => {
    if (!currentRecommendation) return;
    const exists = savedProducts.some(p => p.name === currentRecommendation.name);
    if (!exists) {
        savedProducts.push(currentRecommendation);
        syncStorage();
        alert('Saved to dashboard.');
    } else { alert('Already saved.'); }
});

const renderComparison = () => {
    const list = document.getElementById('compareList');
    const empty = document.getElementById('compareEmpty');
    list.innerHTML = '';
    
    if (savedProducts.length === 0) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    savedProducts.forEach((p, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 700;">${p.name}</td>
            <td><span class="trend-badge trend-${p.trend}">${p.trend}</span></td>
            <td>$${p.cost.toFixed(2)}</td>
            <td>$${p.netProfitPerUnit.toFixed(2)}</td>
            <td>${p.unitsNeeded}</td>
            <td><button style="background:none; border:none; color:var(--danger); cursor:pointer;" onclick="removeItem(${i})">×</button></td>
        `;
        list.appendChild(row);
    });
};

window.removeItem = (i) => { savedProducts.splice(i, 1); syncStorage(); renderComparison(); };

// --- TRACKER LOGIC ---
const updateTrackerUI = () => {
    const select = document.getElementById('trackerProduct');
    const history = document.getElementById('historyList');
    
    select.innerHTML = '<option value="" disabled selected>— Select Product —</option>';
    savedProducts.forEach(p => select.innerHTML += `<option value="${p.name}">${p.name}</option>`);

    let totalEarned = 0;
    salesHistory.forEach(e => totalEarned += e.profit);

    const percent = currentTarget > 0 ? Math.min(100, (totalEarned / currentTarget) * 100) : 0;
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressPercent').innerText = `${Math.round(percent)}%`;
    document.getElementById('progressStats').innerText = `$${totalEarned.toLocaleString()} / $${currentTarget.toLocaleString()} Net Earned`;

    history.innerHTML = '';
    salesHistory.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(e => {
        history.innerHTML += `<div class="history-item">
            <div><strong>${e.productName}</strong><br><small>${e.date} · ${e.units} units</small></div>
            <div class="history-profit">+$${e.profit.toFixed(2)}</div>
        </div>`;
    });
};

document.getElementById('trackerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('trackerProduct').value;
    const units = parseInt(document.getElementById('unitsSold').value);
    const date = document.getElementById('saleDate').value;
    
    const product = savedProducts.find(p => p.name === name);
    if (product) {
        salesHistory.push({ productName: name, units, date, profit: product.netProfitPerUnit * units });
        syncStorage();
        updateTrackerUI();
        document.getElementById('trackerForm').reset();
    }
});

// Initialization
document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
if (currentTarget > 0) document.getElementById('targetProfit').value = currentTarget;
