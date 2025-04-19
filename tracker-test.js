/* global Chart */
import { trackerStyle } from './tracker-test-style.js';

class PepuTracker extends HTMLElement {
  connectedCallback() {
    this.render();
    this.historyContent = null; // placeholder
    this.setup();
  }

  render() {
    this.innerHTML = `
    <style>
      ${trackerStyle}
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
              <label><input type="checkbox" id="hideStaking" /> Hide Staking Pools</label>
              <label><input type="checkbox" id="hidePresales" /> Hide Presales</label>
            </div>
          </div>
        </div>
        <div id="result"></div>
      </div>

      <!-- Wallet Management Modal -->
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

      <!-- GeckoTerminal Chart Modal -->
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

      <!-- Portfolio History Modal -->
      <div id="historyModal" style="display:none;">
        <div class="modal-overlay"></div>
        <div class="modal-chart">
          <span class="close-modal" id="closeHistoryModal">&times;</span>
          <div id="historyContent" style="color:white;">Loading history...</div>
        </div>
      </div>
    `;

    // Inject Chart.js script if it's not already loaded
    if (!document.querySelector("#chartjs-script")) {
      const s = document.createElement("script");
      s.id = "chartjs-script";
      s.src = "https://cdn.jsdelivr.net/npm/chart.js";
      s.onload = () => console.log("Chart.js loaded");
      document.head.appendChild(s);
    }
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

  openHistoryChart() {
    const historyModal = this.querySelector("#historyModal");
    this.historyContent = this.querySelector("#historyContent");

    historyModal.style.display = "flex";
    this.historyContent.innerHTML = "<div class='pepu-spinner'></div>"; // loading spinner

    const walletsRaw = this.querySelector("#walletInput").value.trim();
    const wallets = walletsRaw.split(",").map(w => w.trim()).filter(w => w.startsWith("0x") && w.length === 42);
    if (wallets.length === 0) {
      this.historyContent.innerHTML = `<p style="color:white;">Please enter a valid wallet address first.</p>`;
      return;
    }

    const signatureData = JSON.parse(localStorage.getItem("pepu_history_signature") || "{}");
    const isSigned = signatureData.address && signatureData.signature;

    // Fetch portfolio to check PBTC access
    fetch(`https://pepu-portfolio-tracker-test.onrender.com/portfolio?wallet=${wallets[0]}`)
      .then(res => res.json())
      .then(portfolio => {
        const hasPBTCAccess = (portfolio.tokens || []).some(t => t.symbol === "PBTC" && t.amount >= 2_000_000);

        if (!hasPBTCAccess) {
          this.historyContent.innerHTML = `
            <p style="color:white;">🚫 This feature is only available to wallets holding at least <strong>2M PBTC</strong>.</p>
          `;
          return;
        }

        if (!isSigned) {
          this.historyContent.innerHTML = `
            <p style="color:white;">✍️ This is a premium feature. Please sign a message to unlock access.</p>
            <button class="pepu-button" id="signAccessBtn">Sign to unlock</button>
          `;
          setTimeout(() => {
            document.getElementById("signAccessBtn").onclick = async () => {
              if (!window.ethereum) {
                alert("MetaMask is required.");
                return;
              }
              const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
              const address = accounts[0];
              const message = `Access portfolio history for ${address}`;
              const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [message, address],
              });
              localStorage.setItem("pepu_history_signature", JSON.stringify({ address, signature }));
              alert("Signature saved. Reopen history modal to continue.");
              historyModal.style.display = "none";
            };
          }, 100);
          return;
        }

        // ✅ If signed and has access, render chart
        this.renderHistoryChart(wallets, signatureData);
      })
      .catch(err => {
        console.error("Error checking PBTC access:", err);
        this.historyContent.innerHTML = `<p style="color:red;">Failed to load history access info.</p>`;
      });
  }


  setup() {
    const walletInput = this.querySelector("#walletInput");
    walletInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!fetchBtn.disabled) {
          fetchBtn.click();
        }
      }
    });
    const dropdown = this.querySelector("#walletDropdown");
    const fetchBtn = this.querySelector("#fetchBtn");
    const resultDiv = this.querySelector("#result");
    const hideSmall = this.querySelector("#hideSmall");
    const hideLPs = this.querySelector("#hideLPs");
    const hidePresales = this.querySelector("#hidePresales");
    const hideStaking = this.querySelector("#hideStaking");

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
    const formatDuration = (seconds) => {
      if (seconds >= 86400) return (seconds / 86400).toFixed(1) + " days";
      if (seconds >= 3600) return (seconds / 3600).toFixed(1) + " hrs";
      return (seconds / 60).toFixed(0) + " min";
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
          const selectedAddresses = wallets.filter(w => w.selected).map(w => w.address);
          walletInput.value = selectedAddresses.join(", ");
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

    const walletModal = this.querySelector("#walletModal");
    const closeWalletModal = this.querySelector("#closeWalletModal");
    
    this.querySelector("#openWalletModal").onclick = () => {
      walletModal.style.display = "flex";
    };
    
    closeWalletModal.onclick = () => {
      walletModal.style.display = "none";
    };
    
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        walletModal.style.display = "none";
      }
    });

    const walletListDiv = this.querySelector("#walletList");

    const loadWallets = () => {
      const raw = JSON.parse(localStorage.getItem("pepu_wallets_v2") || "[]");
      return Array.isArray(raw) ? raw : [];
    };

    const saveWallets = (list) => {
      localStorage.setItem("pepu_wallets_v2", JSON.stringify(list));
    };

    const renderWalletList = () => {
    const wallets = loadWallets();
    walletListDiv.innerHTML = "";

    wallets.forEach((walletObj, i) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.marginBottom = "10px";
      row.style.gap = "10px";
      row.style.flexWrap = "wrap";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = walletObj.selected;
      checkbox.style.accentColor = "#F1BC4A";
      checkbox.style.width = "16px";
      checkbox.style.height = "16px";
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
      editBtn.style.fontSize = "16px";
      editBtn.title = "Edit label";

      const enterEditMode = () => {
        const input = document.createElement("input");
        input.value = wallets[i].label || `Wallet ${i + 1}`;
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

      editBtn.onclick = enterEditMode;
      label.ondblclick = enterEditMode;

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
      delBtn.style.fontSize = "18px";
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


    // Add wallet row
    const addRow = document.createElement("div");
    addRow.style.display = "flex";
    addRow.style.alignItems = "center";
    addRow.style.gap = "8px";
    addRow.style.marginTop = "20px";
    addRow.style.flexWrap = "nowrap"; // prevents wrapping

    const newLabel = document.createElement("input");
    newLabel.placeholder = "Label (optional)";
    newLabel.style.flex = "0 0 28%"; // Shorter fixed width (~28%)
    newLabel.style.padding = "6px";
    newLabel.style.minWidth = "0"; // Allows shrinking if necessary

    const newAddress = document.createElement("input");
    newAddress.placeholder = "0x wallet address";
    newAddress.style.flex = "1 1 auto"; // Takes remaining space
    newAddress.style.padding = "6px";
    newAddress.style.minWidth = "150";

    const addBtn = document.createElement("span");
    addBtn.className = "wallet-add-btn";
    addBtn.textContent = "+";
    addBtn.style.cursor = "pointer";
    addBtn.style.color = "#039112";
    addBtn.style.fontSize = "40px";
    addBtn.title = "Add wallet";
    addBtn.style.display = "flex";
    addBtn.style.alignItems = "center";
    addBtn.style.justifyContent = "center";
    addBtn.onclick = () => {
      const addr = newAddress.value.trim();
      if (!addr.startsWith("0x") || addr.length !== 42) return alert("Invalid wallet address.");
      const label = newLabel.value.trim();
      wallets.push({ address: addr, label: label || `Wallet ${wallets.length + 1}`, selected: true });
      saveWallets(wallets);
      renderWalletList();
    };

    addRow.appendChild(newLabel);
    addRow.appendChild(newAddress);
    addRow.appendChild(addBtn);
    walletListDiv.appendChild(addRow);

    const chartModal = document.getElementById("chartModal");
    const closeChartModal = document.getElementById("closeChartModal");
    const chartIframe = document.getElementById("chartIframe");
    const chartSpinner = document.getElementById("chartSpinner");

    closeChartModal.onclick = () => {
      chartModal.style.display = "none";
      chartIframe.src = ""; // clear iframe
      chartIframe.style.display = "none";
    };

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        chartModal.style.display = "none";
        chartIframe.src = "";
        chartIframe.style.display = "none";
      }
    });

    chartIframe.onload = () => {
      chartSpinner.style.display = "none";
      chartIframe.style.display = "block";
    };

    const historyModal = this.querySelector("#historyModal");
    const closeHistoryModal = this.querySelector("#closeHistoryModal");
    this.historyContent = this.querySelector("#historyContent");

    closeHistoryModal.onclick = () => {
      historyModal.style.display = "none";
    };

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        historyModal.style.display = "none";
      }
    });

  };

    renderWalletList();

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
      resultDiv.innerHTML = `
        <div class="pepu-loading">
          <div>Loading portfolio</div>
          <div class="pepu-spinner" style="margin-top: 10px;"></div>
        </div>`;

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
        let stakingPools = [];
        let stakingUsdTotal = 0;

        for (const wallet of wallets) {
          const [portfolio, lps, presales, staking] = await Promise.all([
            fetch(`${baseUrl}/portfolio?wallet=${wallet}`).then(res => res.json()),
            fetch(`${baseUrl}/lp-positions?wallet=${wallet}`).then(res => res.json()),
            fetch(`${baseUrl}/presales?wallet=${wallet}`).then(res => res.json()),
            fetch(`${baseUrl}/staking?wallet=${wallet}`).then(res => res.json())
          ]);

          for (const key of ["native_pepu", "staked_pepu", "unclaimed_rewards"]) {
            allPortfolio[key].amount += portfolio[key].amount;
            allPortfolio[key].total_usd += portfolio[key].total_usd;
            allPortfolio[key].price_usd = portfolio[key].price_usd;
            allPortfolio[key].icon = portfolio[key].icon;
          }

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

          stakingPools = stakingPools.concat(staking.staking_pools || []);
          stakingUsdTotal += staking.total_value_usd || 0;
        }

        allPortfolio.tokens = Array.from(allTokens.values());

        return {
          portfolio: allPortfolio,
          lps: { lp_positions: lpPositions, total_value_usd: lpPositions.reduce((sum, lp) => sum + (lp.amount0_usd + lp.amount1_usd), 0) },
          presales: { pesw: presale, total_value_usd: presaleUsdTotal },
          staking: { staking_pools: stakingPools, total_value_usd: stakingUsdTotal }
        };
      };

      const { portfolio, lps, presales, staking } = await fetchAll();

      const hasPBTCAccess = portfolio.tokens.some(t => t.symbol === "PBTC" && t.amount >= 2_000_000);
      const signatureData = JSON.parse(localStorage.getItem("pepu_history_signature") || "{}");
      const isSigned = signatureData.address && signatureData.signature;

      if (hasPBTCAccess) {
        if (!isSigned) {
          this.openHistoryChart(); // this sets and shows the modal
          this.historyContent.innerHTML = `
            <p style="color:white; font-family:'Poppins', sans-serif; font-size:16px;">
              ✍️ This is a premium feature. Please sign a message to unlock access.
            </p>
            <button class="pepu-button" id="signAccessBtn">Sign to unlock</button>
          `;
          setTimeout(() => {
            document.getElementById("signAccessBtn").onclick = async () => {
              if (!window.ethereum) {
                alert("MetaMask is required.");
                return;
              }
              const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
              const address = accounts[0];
              const message = `Access portfolio history for ${address}`;
              const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [message, address],
              });
              localStorage.setItem("pepu_history_signature", JSON.stringify({ address, signature }));
              alert("Signature saved. Reopen history modal to continue.");
              document.getElementById("historyModal").style.display = "none";
            };
          }, 100);
        } else {
          // ✅ Call function to load and render chart
          this.renderHistoryChart(wallets, signatureData);
        }
      } else {
        this.historyContent.innerHTML = `
          <p style="color:white; font-family:'Poppins', sans-serif; font-size:16px;">
            🚫 This feature is only available to wallets holding at least <strong>2M PBTC</strong>.
          </p>
        `;
      }

      let total = portfolio.total_value_usd;

      const hideSmallBalances = hideSmall.checked;
      const hideLP = hideLPs.checked;
      const hidePresale = hidePresales.checked;

      if (!hideLP) total += lps.total_value_usd || 0;
      if (!hideStaking.checked) total += staking.total_value_usd || 0;
      if (!hidePresale) total += presales.total_value_usd || 0;

      let html = `
        <div class="pepu-card total-card">
          <div style="font-size: 22px; font-weight: bold; margin-bottom: 10px;">
            Total Portfolio Value: ${formatUSD(total)}
            <span class="chart-icon" style="cursor:pointer; font-size:16px; font-weight:normal; margin-left:10px; text-decoration:underline; color:#F1BC4A;"
              onclick="document.querySelector('tracker-test').openHistoryChart()">
              Show History
            </span>
          </div>
          <div class="animated-bar-wrapper">
            ${[
              { label: "PEPU", value: portfolio.native_pepu.total_usd + portfolio.staked_pepu.total_usd + portfolio.unclaimed_rewards.total_usd, color: "#039112" },
              { label: "L2 Tokens", value: portfolio.tokens.reduce((sum, t) => (hideSmallBalances && ((t.total_usd > 0 && t.total_usd < 1) || (t.total_usd === 0 && t.amount <= 1) || (t.warning && t.warning.toLowerCase().includes("low liquidity")))) ? sum : sum + t.total_usd, 0) + (hideStaking.checked ? 0 : staking.total_value_usd || 0), color: "#F1BC4A" },
              { label: "LPs", value: hideLP ? 0 : lps.total_value_usd, color: "#3395FF" },
              { label: "Presales", value: hidePresale ? 0 : presales.total_value_usd, color: "#AA74E2" }
            ]
              .filter(seg => seg.value > 0)
              .sort((a, b) => b.value - a.value)
              .map((seg, index) => {
                const pct = total > 0 ? (seg.value / total * 100).toFixed(1) : "0.0";
                return `
                  <div class="animated-segment" style="--bar-color: ${seg.color}; --bar-width: ${pct}%; animation-delay: ${index * 0.1}s;">
                    <span>${pct}%<br><strong>${formatUSD(seg.value)}</strong><br>${seg.label}</span>
                  </div>`;
              }).join("")}
          </div>
        </div>
        <div class="pepu-card-container">
      `;

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
                  <span class="chart-icon" data-contract="${token.contract}">🗗</span>
                  24h: <span class="${token.price_change_24h_percentage >= 0 ? 'up' : 'down'}">
                    ${token.price_change_24h_percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
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

      const visibleStakingPools = staking.staking_pools.filter(pool => pool.staked_amount > 0);

      if (!hideStaking.checked && visibleStakingPools.length > 0) {
        html += `<div class="lp-title">Staking Pools</div><div class="pepu-card-container">`;

        visibleStakingPools.forEach(pool => {
          const apyText = pool.apy ? `${pool.apy.toFixed(2)}%` : "N/A";
          const lockDurationText = pool.lock_duration === 0 ? "N/A" : formatDuration(pool.lock_duration);
          const showRemaining = pool.lock_duration !== 0;
          const remainingLockText = formatDuration(pool.remaining_lock_time);
          const totalUSD = formatUSD(pool.total_value_usd);

          html += `
            <div class="pepu-card">
              <div class="pepu-token-header">
                <img src="${pool.icon_url}" width="32" height="32" />
                <strong class="name">${pool.pool_name}</strong>
              </div>
              <div class="amount">Amount staked: ${formatAmount(pool.staked_amount)}</div>
              <div class="amount">Pending rewards: ${formatAmount(pool.pending_rewards)}</div>
              <div class="amount">APY: ${apyText}</div>
              <div class="amount">Lock duration: ${lockDurationText}</div>
              ${showRemaining ? `<div class="amount">Remaining lock time: ${remainingLockText}</div>` : ""}
              <div class="price">Price: ${formatPrice(pool.price_usd)}</div>
              <div class="price bold" style="margin-top: 8px;">Total: ${totalUSD}</div>
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
    };
  }


  async renderHistoryChart(wallets, signatureData) {
    const ensureChartJs = () => new Promise((resolve) => {
      if (window.Chart) return resolve();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/chart.js";
      s.onload = () => resolve();
      document.head.appendChild(s);
    });

    await ensureChartJs();

    const message = `Access portfolio history for ${signatureData.address}`;
    const res = await fetch(
      `https://pepu-portfolio-tracker-test.onrender.com/wallet-history?wallets=${wallets[0]}&message=${encodeURIComponent(message)}&signature=${encodeURIComponent(signatureData.signature)}`
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Failed to fetch history:", res.status, errorText);
      this.historyContent.innerHTML = `<p style="color:red;">Failed to load history: ${res.status}</p>`;
      return;
    }

    const raw = await res.json();
    const history = raw[wallets[0].toLowerCase()] || [];

    if (!Array.isArray(history) || history.length === 0) {
      this.historyContent.innerHTML = `<p style="color:white;">No history data available for this wallet.</p>`;
      return;
    }

    const labels = history.map(d => new Date(d.timestamp).toLocaleTimeString());
    const pepu = history.map(d => d.pepu_usd);
    const tokens = history.map(d => d.l2_usd);
    const lps = history.map(d => d.lp_usd);
    const presales = history.map(d => d.presale_usd);
    const total = history.map(d => d.pepu_usd + d.l2_usd + d.lp_usd + d.presale_usd);

    this.historyContent.innerHTML = `<canvas id="historyChart" style="max-width:100%; max-height:100%;"></canvas>`;

    const ctx = this.querySelector("#historyChart").getContext("2d");

    new window.Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Total", data: total, borderColor: "#ffffff", borderWidth: 2, tension: 0.3 },
          { label: "PEPU", data: pepu, borderColor: "#039112", tension: 0.3 },
          { label: "L2 Tokens", data: tokens, borderColor: "#F1BC4A", tension: 0.3 },
          { label: "LPs", data: lps, borderColor: "#3395FF", tension: 0.3 },
          { label: "Presales", data: presales, borderColor: "#AA74E2", tension: 0.3 },
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        elements: {
          point: {
            radius: 2
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: 'white', font: { size: 13 } }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            ticks: { color: "white", maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
            grid: { color: "rgba(255,255,255,0.1)" }
          },
          y: {
            ticks: { color: "white" },
            grid: { color: "rgba(255,255,255,0.1)" }
          }
        }
      }
    });
  }



}

customElements.define("tracker-test", PepuTracker);
