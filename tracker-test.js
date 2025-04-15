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
        margin-bottom: 20px;
        position: relative;
        z-index: 20;
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
        padding-bottom: 14px;
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
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .wallet-input-wrapper {
        flex: 1;
        position: relative;
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
        margin-top: -2px;
        left: 0;
        width: calc(100% - 2px);
        background: white;
        border: 1px solid #ccc;
        border-top: none;
        z-index: 10;
        font-family: 'Raleway', sans-serif;
        font-size: 15px;
        max-height: 250px;
        overflow-y: auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .wallet-dropdown div {
        padding: 10px;
        cursor: pointer;
        color: black;
        font-size: 15px;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

      .token-stats {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        font-size: 14px;
        white-space: nowrap;
        margin-left: auto;
        text-align: right;
        line-height: 1.3;
      }

      .token-stats .change span.up {
        color: #039112;
        font-weight: bold;
      }

      .token-stats .change span.down {
        color: #c60000;
        font-weight: bold;
      }

      .chart-icon {
        cursor: pointer;
        font-size: 1em;
        margin-right: 1px;
        transition: color 0.2s ease;
      }

      .chart-icon:hover {
        color: #039112;
      }

      .pepu-loading,
      .pepu-error {
        text-align: center;
        margin-top: 20px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
      }

      .pepu-loading {
        color: white;
        font-size: 20px;
      }

      .pepu-error {
        color: red;
        font-size: 18px;
      }

      #openWalletModal {
        height: 42px;
        padding: 0 16px;
        font-size: 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #walletModal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .modal-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 1;
      }

      .modal-content {
        position: relative;
        background-color: #111;
        border: 3px solid #F1BC4A;
        border-radius: 15px;
        padding: 30px;
        z-index: 2;
        width: 90%;
        max-width: 510px;
        max-height: 80%;
        overflow-y: auto;
        scrollbar-gutter: stable;
        padding-right: 10px;
      }

      .close-modal {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 28px;
        color: #F1BC4A;
        cursor: pointer;
      }

      #chartModal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      #chartModal .modal-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 1;
      }

      #chartModal .modal-chart {
        position: relative;
        background-color: #000;
        border: 3px solid #F1BC4A;
        border-radius: 15px;
        z-index: 2;
        width: 95%;
        height: 85%;
      }

      .animated-bar-wrapper {
        display: flex;
        height: 60px;
        border-radius: 10px;
        overflow: hidden;
        background: rgba(255,255,255,0.1);
        position: relative;
        margin-top: 10px;
        font-family: 'Raleway', sans-serif;
      }

      .animated-segment {
        background: var(--bar-color);
        width: 0%;
        color: white;
        font-size: 14px;
        text-align: center;
        padding: 6px 8px;
        animation: growBar 0.6s ease-out forwards;
      }

      @keyframes growBar {
        to {
          width: var(--bar-width);
        }
      }

      .pepu-spinner {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #F1BC4A;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 0.8s linear infinite;
        margin: auto;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 700px) {
        .filter-row {
          flex-direction: column;
          align-items: flex-start;
        }

        .modal-content {
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          border-radius: 0;
          padding: 20px;
          box-sizing: border-box;
        }

        .add-wallet-row {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
          width: 100%;
        }

        .add-wallet-row input {
          width: 100%;
          padding: 8px;
          font-size: 14px;
        }

        .add-wallet-row span {
          font-size: 32px;
          align-self: flex-end;
          margin-right: 4px;
          line-height: 1;
        }
      }
    </style>

    <div id="pepu-app" style="max-width: 1000px; margin: auto;">
      <div class="pepu-card input-card">
        <div class="wallet-container">
          <div class="wallet-input-wrapper">
            <input id="walletInput" type="text" placeholder="Enter wallet address (0x...)" />
            <div id="walletDropdown" class="wallet-dropdown" style="display:none;"></div>
          </div>
          <button id="openWalletModal" class="pepu-button" title="Manage wallets">☰</button>
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

    <div id="walletModal" style="display:none;">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <span class="close-modal" id="closeWalletModal">&times;</span>
        <h2 style="color: white; font-family: 'Poppins', sans-serif; font-size: 26px; margin-bottom: 10px;">Manage Wallets</h2>
        <p style="color: #ccc; font-family: 'Raleway', sans-serif; font-size: 14px; margin-bottom: 20px;">
          You can save multiple wallets here and select which ones to include in the Multi Wallet view using the checkboxes.
          When 'Multiwallet' is selected in the dropdown, the tracker will combine the selected wallets into one portfolio.
        </p>
        <div id="walletList"></div>
      </div>
    </div>

    <div id="chartModal" style="display:none;">
      <div class="modal-overlay"></div>
      <div class="modal-chart" style="padding: 0; max-width: 90%; max-height: 90%; overflow: hidden;">
        <span class="close-modal" id="closeChartModal" style="z-index: 3; position: absolute; top: 15px; right: 20px; font-size: 28px; color: #F1BC4A; cursor: pointer;">&times;</span>
        <div style="position: relative; width: 100%; height: 100%;">
          <div id="chartSpinner" class="pepu-spinner" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2;"></div>
          <iframe id="chartIframe" width="100%" height="100%" frameborder="0" allowfullscreen style="border: none; display: none;"></iframe>
        </div>
      </div>
    </div>
    `;
  }
  openChart(contractAddress) {
    const chartModal = this.querySelector("#chartModal");
    const chartIframe = this.querySelector("#chartIframe");
    const chartSpinner = this.querySelector("#chartSpinner");

    chartIframe.style.display = "none";
    chartSpinner.style.display = "block";
    chartIframe.src = `https://www.geckoterminal.com/pepe-unchained/pools/${contractAddress}?embed=1&info=0&swaps=0&grayscale=1&light_chart=0`;
    chartModal.style.display = "flex";
  }

  setup() {
    const walletInput = this.querySelector("#walletInput");
    const dropdown = this.querySelector("#walletDropdown");
    const fetchBtn = this.querySelector("#fetchBtn");
    const resultDiv = this.querySelector("#result");
    const hideSmall = this.querySelector("#hideSmall");
    const hideLPs = this.querySelector("#hideLPs");
    const hidePresales = this.querySelector("#hidePresales");

    const formatAmount = (n) => {
      const val = Number(n);
      if (val >= 1e9) return (val / 1e9).toFixed(2) + "B";
      if (val >= 1e6) return (val / 1e6).toFixed(2) + "M";
      if (val >= 1e3) return (val / 1e3).toFixed(2) + "K";
      return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    };

    const formatUSD = (n) => n ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A";
    const formatPrice = (p) => p ? `$${p.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}` : "N/A";

    const loadWallets = () => {
      const raw = JSON.parse(localStorage.getItem("pepu_wallets_v2") || "[]");
      return Array.isArray(raw) ? raw : [];
    };

    const saveWallets = (list) => {
      localStorage.setItem("pepu_wallets_v2", JSON.stringify(list));
    };

    const updateDropdown = () => {
      dropdown.innerHTML = "";
      const wallets = loadWallets();
      const hasMultipleSelected = wallets.filter(w => w.selected).length > 1;

      if (wallets.length === 0) {
        dropdown.style.display = "none";
        return;
      }

      if (hasMultipleSelected) {
        const multiOption = document.createElement("div");
        multiOption.textContent = "🧮 Multiwallet (combined)";
        multiOption.style.fontWeight = "bold";
        multiOption.onclick = () => {
          const selected = wallets.filter(w => w.selected).map(w => w.address);
          walletInput.value = selected.join(", ");
          dropdown.style.display = "none";
        };
        dropdown.appendChild(multiOption);
      }

      wallets.forEach((walletObj) => {
        const option = document.createElement("div");
        option.textContent = `${walletObj.label || "Unnamed"} – ${walletObj.address}`;
        option.title = walletObj.address;
        option.onclick = () => {
          walletInput.value = walletObj.address;
          dropdown.style.display = "none";
          fetchBtn.click();
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

    walletInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!fetchBtn.disabled) fetchBtn.click();
      }
    });

    const walletModal = this.querySelector("#walletModal");
    const closeWalletModal = this.querySelector("#closeWalletModal");
    const openWalletModal = this.querySelector("#openWalletModal");

    openWalletModal.onclick = () => walletModal.style.display = "flex";
    closeWalletModal.onclick = () => walletModal.style.display = "none";

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        walletModal.style.display = "none";
      }
    });

    const walletListDiv = this.querySelector("#walletList");

    const renderWalletList = () => {
      const wallets = loadWallets();
      walletListDiv.innerHTML = "";

      wallets.forEach((walletObj, i) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.gap = "10px";
        row.style.marginBottom = "10px";
        row.style.flexWrap = "wrap";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = walletObj.selected;
        checkbox.style.accentColor = "#F1BC4A";
        checkbox.style.cursor = "pointer";
        checkbox.onchange = () => {
          wallets[i].selected = checkbox.checked;
          saveWallets(wallets);
        };

        const labelWrapper = document.createElement("div");
        labelWrapper.style.display = "flex";
        labelWrapper.style.alignItems = "center";
        labelWrapper.style.gap = "6px";
        labelWrapper.style.flex = "1";
        labelWrapper.style.minWidth = "100px";

        const label = document.createElement("div");
        label.textContent = walletObj.label || `Wallet ${i + 1}`;
        label.style.color = "white";
        label.style.cursor = "pointer";
        label.style.fontFamily = "Raleway, sans-serif";
        label.style.fontSize = "16px";
        label.style.overflow = "hidden";
        label.style.textOverflow = "ellipsis";
        label.style.whiteSpace = "nowrap";
        label.style.maxWidth = "100px";

        const editBtn = document.createElement("span");
        editBtn.textContent = "✏️";
        editBtn.style.cursor = "pointer";
        editBtn.title = "Edit label";

        const enterEditMode = () => {
          const input = document.createElement("input");
          input.value = walletObj.label || `Wallet ${i + 1}`;
          input.style.width = "100px";
          input.style.padding = "4px";
          input.style.fontFamily = "Raleway, sans-serif";
          input.onblur = () => {
            wallets[i].label = input.value;
            saveWallets(wallets);
            renderWalletList();
          };
          input.onkeydown = (e) => {
            if (e.key === "Enter") input.blur();
          };
          labelWrapper.replaceChild(input, label);
          editBtn.style.display = "none";
          input.focus();
        };

        label.ondblclick = enterEditMode;
        editBtn.onclick = enterEditMode;

        labelWrapper.appendChild(label);
        labelWrapper.appendChild(editBtn);

        const addr = document.createElement("div");
        addr.textContent = walletObj.address;
        addr.style.color = "gray";
        addr.style.fontSize = "13px";
        addr.style.flex = "2";
        addr.style.overflowWrap = "break-word";

        const delBtn = document.createElement("span");
        delBtn.textContent = "❌";
        delBtn.style.cursor = "pointer";
        delBtn.style.color = "red";
        delBtn.title = "Remove wallet";
        delBtn.onclick = () => {
          wallets.splice(i, 1);
          saveWallets(wallets);
          renderWalletList();
        };

        row.appendChild(checkbox);
        row.appendChild(labelWrapper);
        row.appendChild(addr);
        row.appendChild(delBtn);
        walletListDiv.appendChild(row);
      });

      // New wallet row
      const addRow = document.createElement("div");
      addRow.className = "add-wallet-row";

      const newLabel = document.createElement("input");
      newLabel.placeholder = "Label (optional)";
      const newAddress = document.createElement("input");
      newAddress.placeholder = "0x wallet address";

      const addBtn = document.createElement("span");
      addBtn.textContent = "+";
      addBtn.title = "Add wallet";
      addBtn.style.cursor = "pointer";
      addBtn.style.fontSize = "40px";
      addBtn.style.color = "#039112";
      addBtn.onclick = () => {
        const addr = newAddress.value.trim();
        if (!addr.startsWith("0x") || addr.length !== 42) {
          alert("Invalid wallet address.");
          return;
        }
        wallets.push({ address: addr, label: newLabel.value.trim(), selected: true });
        saveWallets(wallets);
        renderWalletList();
      };

      addRow.appendChild(newLabel);
      addRow.appendChild(newAddress);
      addRow.appendChild(addBtn);
      walletListDiv.appendChild(addRow);
    };

    renderWalletList();
    fetchBtn.onclick = async () => {
      const input = walletInput.value.trim();
      const wallets = input.split(",").map(w => w.trim()).filter(w => w.startsWith("0x") && w.length === 42);

      if (wallets.length === 0) {
        resultDiv.innerHTML = `<p class="pepu-error">Please enter at least one valid wallet address.</p>`;
        return;
      }

      dropdown.style.display = "none";
      resultDiv.innerHTML = `
        <div class="pepu-loading">
          <div>Loading portfolio</div>
          <div class="pepu-spinner" style="margin-top: 10px;"></div>
        </div>`;

      const baseUrl = "https://pepu-portfolio-tracker-test.onrender.com";
      const savedWallets = JSON.parse(localStorage.getItem("pepu_wallets") || "[]");
      wallets.forEach(wallet => {
        if (!savedWallets.includes(wallet)) savedWallets.unshift(wallet);
      });
      localStorage.setItem("pepu_wallets", JSON.stringify(savedWallets));

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

          ["native_pepu", "staked_pepu", "unclaimed_rewards"].forEach(key => {
            allPortfolio[key].amount += portfolio[key].amount;
            allPortfolio[key].total_usd += portfolio[key].total_usd;
            allPortfolio[key].price_usd = portfolio[key].price_usd;
            allPortfolio[key].icon = portfolio[key].icon;
          });

          portfolio.tokens.forEach(token => {
            if (!allTokens.has(token.contract)) {
              allTokens.set(token.contract, { ...token });
            } else {
              const existing = allTokens.get(token.contract);
              existing.amount += token.amount;
              existing.total_usd += token.total_usd;
            }
          });

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
        return {
          portfolio: allPortfolio,
          lps: {
            lp_positions: lpPositions,
            total_value_usd: lpPositions.reduce((sum, lp) => sum + (lp.amount0_usd + lp.amount1_usd), 0)
          },
          presales: { pesw: presale, total_value_usd: presaleUsdTotal }
        };
      };

      const { portfolio, lps, presales } = await fetchAll();
      let total = portfolio.total_value_usd;

      if (!hideLPs.checked) total += lps.total_value_usd;
      if (!hidePresales.checked) total += presales.total_value_usd;

      const hideSmallBalances = hideSmall.checked;
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

      let html = `
        <div class="pepu-card total-card">
          <div style="font-size: 22px; font-weight: bold; margin-bottom: 10px;">
            Total Portfolio Value: ${formatUSD(total)}
          </div>
          <div class="animated-bar-wrapper">
            ${[
              { label: "PEPU", value: portfolio.native_pepu.total_usd + portfolio.staked_pepu.total_usd + portfolio.unclaimed_rewards.total_usd, color: "#039112" },
              { label: "L2 Tokens", value: portfolio.tokens.reduce((sum, t) => {
                if (hideSmallBalances && ((t.total_usd > 0 && t.total_usd < 1) || (t.total_usd === 0 && t.amount <= 1) || (t.warning && t.warning.toLowerCase().includes("low liquidity")))) return sum;
                return sum + t.total_usd;
              }, 0), color: "#F1BC4A" },
              { label: "LPs", value: hideLPs.checked ? 0 : lps.total_value_usd, color: "#3395FF" },
              { label: "Presales", value: hidePresales.checked ? 0 : presales.total_value_usd, color: "#AA74E2" }
            ].filter(seg => seg.value > 0).sort((a, b) => b.value - a.value).map((seg, i) => {
              const pct = total > 0 ? (seg.value / total * 100).toFixed(1) : "0.0";
              return `<div class="animated-segment" style="--bar-color: ${seg.color}; --bar-width: ${pct}%; animation-delay: ${i * 0.1}s;"><span>${pct}%<br><strong>${formatUSD(seg.value)}</strong><br>${seg.label}</span></div>`;
            }).join("")}
          </div>
        </div>
        <div class="pepu-card-container">`;

      html += renderCard("Wallet PEPU", portfolio.native_pepu);
      html += renderCard("Staked PEPU", portfolio.staked_pepu);
      html += renderCard("Unclaimed Rewards", portfolio.unclaimed_rewards);
      html += `</div><div class="pepu-card-container" style="margin-top: 30px;">`;

      portfolio.tokens.forEach(token => {
        if (hideSmall.checked && (
          (token.total_usd > 0 && token.total_usd < 1) ||
          (token.total_usd === 0 && token.amount <= 10) ||
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
            <div style="display: flex; justify-content: space-between; gap: 10px;">
              <div>
                <div class="amount">Amount: ${formatAmount(token.amount)}</div>
                <div class="price">Price: ${formatPrice(token.price_usd)}</div>
                <div class="price bold">Total: ${formatUSD(token.total_usd)}</div>
                ${token.warning ? `<div style="color:red;">⚠️ ${token.warning}</div>` : ""}
              </div>
              <div class="token-stats" style="cursor:pointer;" onclick="document.querySelector('tracker-test').openChart('${token.contract}')">
                <div>VOL 24h: <span>${formatAmount(token.volume_24h_usd)}</span></div>
                <div class="change">
                  <span class="chart-icon">🗗</span>
                  24h: <span class="${token.price_change_24h_percentage >= 0 ? 'up' : 'down'}">${token.price_change_24h_percentage.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>`;
      });

      html += `</div>`;

      if (!hideLPs.checked && lps.lp_positions.length > 0) {
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
      if (!hidePresales.checked && p && (p.deposited_tokens > 0 || p.staked_tokens > 0 || p.pending_rewards > 0)) {
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
    };

    const chartModal = this.querySelector("#chartModal");
    const chartIframe = this.querySelector("#chartIframe");
    const chartSpinner = this.querySelector("#chartSpinner");
    const closeChartModal = this.querySelector("#closeChartModal");

    chartIframe.onload = () => {
      chartSpinner.style.display = "none";
      chartIframe.style.display = "block";
    };

    closeChartModal.onclick = () => {
      chartModal.style.display = "none";
      chartIframe.src = "";
      chartIframe.style.display = "none";
    };

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        chartModal.style.display = "none";
        chartIframe.src = "";
        chartIframe.style.display = "none";
      }
    });
  }
}

customElements.define("tracker-test", PepuTracker);
