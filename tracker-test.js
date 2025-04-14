class PepuTracker extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setup();
  }

  render() {
    this.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&family=Raleway:wght@400&display=swap');

        .pepu-card-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          justify-items: stretch;
        }

        .pepu-card {
          background: #F1BC4A;
          border: 3px solid #000;
          border-radius: 15px;
          padding: 10px;
          color: #000;
          min-width: 280px;
          box-sizing: border-box;
          font-family: 'Raleway', sans-serif;
        }

        .pepu-card.pepu-main {
          background: #039112;
          color: #fff;
        }

        .pepu-card.total-card {
          background: #000;
          border: 3px solid #F1BC4A;
          color: #fff;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 30px;
        }

        .pepu-card.input-card {
          background: rgba(255, 255, 255, 0.15);
          border: 3px solid #F1BC4A;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #000;
          font-family: 'Raleway', sans-serif;
          margin-bottom: 20px;
        }

        .pepu-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 15px;
          align-items: center;
        }
        
        .pepu-filters label {
          color: white;
          font-weight: bold;
          font-size: 16px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Raleway', sans-serif;
          padding-bottom: 14px; /* 🔧 Aligns label text better with button */
        }
        
        .pepu-filters input[type="checkbox"] {
          accent-color: #F1BC4A;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .wallet-container {
          position: relative;
          margin-bottom: 10px;
        }

        #walletInput {
          width: 100%;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
          font-size: 16px;
          font-family: 'Raleway', sans-serif;
          background-color: white;
        }

        .wallet-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ccc;
          border-top: none;
          z-index: 10;
          font-family: 'Raleway', sans-serif;
        }

        .wallet-dropdown div {
          padding: 10px;
          cursor: pointer;
          color: black;
        }

        .wallet-dropdown div:hover {
          background: #eee;
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .filter-row label {
          font-family: 'Raleway', sans-serif;
          font-size: 15px;
          color: #000;
        }

        .pepu-button {
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 15px;
          border: 2px solid #000;
          background-color: #039112;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .pepu-button:hover {
          background-color: #F1BC4A;
          color: #000;
        }

        .lp-title {
          font-size: 24px;
          color: white;
          text-align: center;
          margin: 30px 0 10px;
          font-family: 'Poppins', sans-serif;
        }

        .lp-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lp-tokens {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lp-token {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-family: 'Raleway', sans-serif;
        }

        .lp-token img {
          width: 28px;
          height: 28px;
          border-radius: 4px;
        }

        .lp-total {
          font-weight: bold;
          font-size: 18px;
          text-align: center;
        }

        .pepu-token-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .pepu-token-header img {
          margin-right: 10px;
          border-radius: 4px;
        }

        .pepu-token-header .name {
          font-family: 'Poppins', sans-serif;
          font-size: 17px;
          font-weight: 600;
        }

        .pepu-card .price,
        .pepu-card .amount {
          font-size: 15px;
        }

        .pepu-card .price.bold {
          font-weight: bold;
        }

        .pepu-loading, .pepu-error {
          text-align: center;
          margin-top: 20px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
        }

        .pepu-loading { color: white; font-size: 20px; }
        .pepu-error { color: red; font-size: 18px; }

        @media (max-width: 700px) {
          .filter-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      </style>

      <div id="pepu-app" style="max-width: 1000px; margin: auto;">
        <div class="pepu-card input-card">
          <div class="wallet-container">
            <input id="walletInput" type="text" placeholder="Enter wallet address (0x...)" />
            <div id="walletDropdown" class="wallet-dropdown" style="display:none;"></div>
          </div>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px; margin-top: 15px;">
            <button id="fetchBtn" class="pepu-button">Check Portfolio</button>
            <div class="pepu-filters">
              <label><input type="checkbox" id="hideSmall" checked /> Hide small balances</label>
              <label><input type="checkbox" id="hideLPs" /> Hide LPs</label>
              <label><input type="checkbox" id="hidePresales" /> Hide Presales</label>
            </div>
          </div>
        </div>
        <div id="result"></div>
      </div>
    `;
  }

  setup() {
    const walletInput = this.querySelector("#walletInput");
    const dropdown = this.querySelector("#walletDropdown");
    const fetchBtn = this.querySelector("#fetchBtn");
    const resultDiv = this.querySelector("#result");
    const hideSmall = this.querySelector("#hideSmall");
    const hideLPs = this.querySelector("#hideLPs");
    const hidePresales = this.querySelector("#hidePresales");

    const savedWallets = JSON.parse(localStorage.getItem("pepu_wallets") || "[]");

    const formatAmount = (n) => {
      const val = Number(n);
      if (val >= 1e9) return (val / 1e9).toFixed(2) + "B";
      if (val >= 1e6) return (val / 1e6).toFixed(2) + "M";
      if (val >= 1e3) return (val / 1e3).toFixed(2) + "K";
      return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    };

    const formatUSD = (n) => n ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A";
    const formatPrice = (p) => p ? `$${p.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}` : "N/A";

    const updateDropdown = () => {
      dropdown.innerHTML = "";
      if (savedWallets.length === 0) return dropdown.style.display = "none";
      savedWallets.forEach((wallet) => {
        const option = document.createElement("div");
        option.textContent = wallet;
        option.onclick = () => {
          walletInput.value = wallet;
          dropdown.style.display = "none";
        };
        dropdown.appendChild(option);
      });
      dropdown.style.display = "block";
    };

    walletInput.addEventListener("focus", updateDropdown);
    walletInput.addEventListener("input", updateDropdown);
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) dropdown.style.display = "none";
    });

    fetchBtn.onclick = async () => {
      const input = walletInput.value.trim();
      const wallets = input.split(",").map(w => w.trim()).filter(w => w.startsWith("0x") && w.length === 42);
    
      if (wallets.length === 0) {
        resultDiv.innerHTML = `<p class="pepu-error">Please enter at least one valid wallet address.</p>`;
        return;
      }
    
      wallets.forEach(wallet => {
        if (!savedWallets.includes(wallet)) {
          savedWallets.unshift(wallet);
        }
      });
      localStorage.setItem("pepu_wallets", JSON.stringify(savedWallets));
    
      dropdown.style.display = "none";
      resultDiv.innerHTML = `<p class="pepu-loading">Loading portfolio...</p>`;
    
      const baseUrl = "https://pepu-portfolio-tracker-test.onrender.com";
    
      const fetchAll = async () => {
        const allPortfolio = {
          native_pepu: { amount: 0, price_usd: 0, total_usd: 0, icon: "" },
          staked_pepu: { amount: 0, price_usd: 0, total_usd: 0, icon: "" },
          unclaimed_rewards: { amount: 0, price_usd: 0, total_usd: 0, icon: "" },
          tokens: [],
          total_value_usd: 0
        };
        const allTokens = new Map();
        let lpPositions = [];
        let presale = null;
        let presaleUsdTotal = 0;
    
        for (const wallet of wallets) {
          const [portfolio, lps, presales] = await Promise.all([
            fetch(`${baseUrl}/portfolio?wallet=${wallet}`).then(res => res.json()),
            fetch(`${baseUrl}/lp-positions?wallet=${wallet}`).then(res => res.json()),
            fetch(`${baseUrl}/presales?wallet=${wallet}`).then(res => res.json())
          ]);
    
          // Combine PEPU native/staked/rewards
          for (const key of ["native_pepu", "staked_pepu", "unclaimed_rewards"]) {
            allPortfolio[key].amount += portfolio[key].amount;
            allPortfolio[key].total_usd += portfolio[key].total_usd;
            allPortfolio[key].price_usd = portfolio[key].price_usd;
            allPortfolio[key].icon = portfolio[key].icon;
          }
    
          // Merge tokens by contract address
          for (const token of portfolio.tokens) {
            if (!allTokens.has(token.contract)) {
              allTokens.set(token.contract, { ...token });
            } else {
              const t = allTokens.get(token.contract);
              t.amount += token.amount;
              t.total_usd += token.total_usd;
            }
          }
    
          allPortfolio.total_value_usd += portfolio.total_value_usd;
          lpPositions = lpPositions.concat(lps.lp_positions || []);
          if (presales.pesw) {
            if (!presale) {
              presale = { ...presales.pesw };
            } else {
              presale.deposited_tokens += presales.pesw.deposited_tokens;
              presale.staked_tokens += presales.pesw.staked_tokens;
              presale.pending_rewards += presales.pesw.pending_rewards;
            }
            presaleUsdTotal += presales.total_value_usd || 0;
          }
        }
    
        allPortfolio.tokens = Array.from(allTokens.values());
        return { portfolio: allPortfolio, lps: { lp_positions: lpPositions, total_value_usd: lpPositions.reduce((sum, lp) => sum + (lp.amount0_usd + lp.amount1_usd), 0) }, presales: { pesw: presale, total_value_usd: presaleUsdTotal } };
      };
    
      const { portfolio, lps, presales } = await fetchAll();

      fetchAll().then(({ portfolio, lps, presales }) => {
        let total = portfolio.total_value_usd;

        const hideSmallBalances = hideSmall.checked;
        const hideLP = hideLPs.checked;
        const hidePresale = hidePresales.checked;

        if (!hideLP) total += lps.total_value_usd || 0;
        if (!hidePresale) total += presales.total_value_usd || 0;

        let html = `<div class="pepu-card total-card">Total Portfolio Value: ${formatUSD(total)}</div><div class="pepu-card-container">`;

        const renderCard = (label, item) => `
          <div class="pepu-card pepu-main">
            <div class="pepu-token-header">
              <img src="${item.icon}" width="40" height="40" />
              <div class="name">${label}</div>
            </div>
            <div class="amount">Amount: ${formatAmount(item.amount)}</div>
            <div class="price">Price: ${formatPrice(item.price_usd)}</div>
            <div class="price bold">Total: ${formatUSD(item.total_usd)}</div>
          </div>`;

        html += renderCard("Wallet PEPU", portfolio.native_pepu);
        html += renderCard("Staked PEPU", portfolio.staked_pepu);
        html += renderCard("Unclaimed Rewards", portfolio.unclaimed_rewards);
        html += `</div><div class="pepu-card-container" style="margin-top: 30px;">`;

        portfolio.tokens.forEach(token => {
          if (hideSmall.checked && (
            (token.total_usd > 0 && token.total_usd < 1) ||
            (token.total_usd === 0 && token.amount <= 1) ||
            (token.warning && token.warning.toLowerCase().includes("low liquidity"))
          )) return;

          html += `
            <div class="pepu-card">
              <div class="pepu-token-header">
                <img src="${token.icon_url}" width="32" height="32" />
                <strong class="name">
                  <a href="https://www.geckoterminal.com/pepe-unchained/pools/${token.contract}" target="_blank" style="text-decoration:none;color:#000;">
                    ${token.name} (${token.symbol})
                  </a>
                </strong>
              </div>
              <div class="amount">Amount: ${formatAmount(token.amount)}</div>
              <div class="price">Price: ${formatPrice(token.price_usd)}</div>
              <div class="price bold">Total: ${formatUSD(token.total_usd)}</div>
              ${token.warning ? `<div style="color:red;">⚠️ ${token.warning}</div>` : ""}
            </div>`;
        });

        html += `</div>`;

        if (!hideLP && lps.lp_positions.length > 0) {
          html += `<div class="lp-title">Liquidity Pool Positions</div><div class="pepu-card-container">`;
          lps.lp_positions.forEach(lp => {
            const totalUsd = lp.amount0_usd + lp.amount1_usd;
            html += `
              <div class="pepu-card">
                <div class="pepu-token-header" style="justify-content:center;">
                  <div class="name">${lp.lp_name}</div>
                </div>
                <div class="lp-row">
                  <div class="lp-tokens">
                    <div class="lp-token"><img src="${lp.token0_icon}" /> ${lp.symbol0}: ${formatAmount(lp.amount0)}</div>
                    <div class="lp-token"><img src="${lp.token1_icon}" /> ${lp.symbol1}: ${formatAmount(lp.amount1)}</div>
                  </div>
                  <div class="lp-total">Total: ${formatUSD(totalUsd)}</div>
                </div>
                ${lp.warning ? `<div style="color:red; margin-top: 6px;">⚠️ ${lp.warning}</div>` : ""}
              </div>`;
          });
          html += `</div>`;
        }

        const p = presales.pesw;
        if (!hidePresale && p && (p.deposited_tokens > 0 || p.staked_tokens > 0 || p.pending_rewards > 0)) {
          const totalTokens = p.deposited_tokens + p.staked_tokens + p.pending_rewards;
          const currentUsd = totalTokens * p.current_price_usd;
          const launchUsd = totalTokens * p.launch_price_usd;

          html += `<div class="lp-title">Token Presales</div><div class="pepu-card-container">`;
          html += `
            <div class="pepu-card">
              <div class="pepu-token-header">
                <img src="${p.icon || 'https://placehold.co/32x32'}" width="32" height="32" />
                <strong class="name">PESW Presale</strong>
              </div>
              <div class="amount">Amount: ${formatAmount(p.deposited_tokens)}</div>
              <div class="amount">Staked: ${formatAmount(p.staked_tokens)}</div>
              <div class="amount">Rewards: ${formatAmount(p.pending_rewards)}</div>
              <div class="price">Current Price: ${formatPrice(p.current_price_usd)}</div>
              <div class="price">Launch Price: ${formatPrice(p.launch_price_usd)}</div>
              <div class="price bold" style="margin-top: 8px;">Total: ${formatUSD(currentUsd)}</div>
              <div class="price">Total at launch: ${formatUSD(launchUsd)}</div>
            </div>
          </div>`;
        }

        resultDiv.innerHTML = html;
      });
    };
  }
}

customElements.define("tracker-test", PepuTracker);
