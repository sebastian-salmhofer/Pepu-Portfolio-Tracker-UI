export const trackerStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&family=Raleway:wght@400&display=swap');

    .pepu-card-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
    align-items: center; /* aligns modal button vertically */
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
    width: calc(100% - 2px); /* Slightly narrower than input to account for border */
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
    border-radius: 10px;
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

    /* === Wallet Modal === */

    #openWalletModal {
    height: 42px; /* match input height */
    padding: 0 16px;
    font-size: 24px;
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

    .modal-chart {
    position: relative;
    background-color: #111;
    border: 3px solid #F1BC4A;
    border-radius: 15px;
    padding: 30px;
    z-index: 2;
    width: 90%;
    max-height: 80%;
    overflow-y: auto;
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

    #historyModal {
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

    #historyModal .modal-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1;
    }

    #historyModal .modal-chart {
        position: relative;
        background-color: #000;
        border: 3px solid #F1BC4A;
        border-radius: 15px;
        z-index: 2;
        width: 95%;
        height: 85%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        overflow: hidden;
    }


    #closeHistoryModal {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 28px;
    color: #F1BC4A;
    cursor: pointer;
    z-index: 3;
    }

    #historyChart {
        width: 100% !important;
        height: 100% !important;
        display: block;
    }

    #historyContent {
        width: 100%;
        height: 100%;
        padding: 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chart-controls-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 20px;
        flex-direction: row;
        font-family: 'Raleway', sans-serif;
        }

        .chart-range-btn {
        background: #000;
        border: 2px solid #F1BC4A;
        color: white;
        font-size: 15px;
        padding: 6px 14px;
        border-radius: 10px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        }

        .chart-range-btn.active {
        background-color: #039112;
        color: white;
        }

        .chart-filter {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: white;
        font-size: 14px;
        margin-left: 10px;
        }

        .chart-filter input[type="checkbox"] {
        accent-color: #F1BC4A;
        transform: scale(1.2);
        cursor: pointer;
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

        .pepu-card {
            min-width: 0; /* allow shrinking */
            width: 100%;
        }

        #fetchBtn {
            width: 100%;
            justify-content: center;
        }

        .pepu-filters {
            column-gap: 10px;
            row-gap: 0px;
            margin-top: 0;
        }

        #openWalletModal {
            background: none;
            border: none;
            padding: 0;
            width: auto;
            height: auto;
            box-shadow: none;
            color: white;
            font-size: 40px;
            position: relative;
            bottom: 2px;
        }

        #chartModal .modal-chart {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            box-sizing: border-box;
        }

        #walletList > div {
            display: grid !important;
            grid-template-columns: auto 1fr auto;
            grid-template-rows: auto auto;
            align-items: center;
            gap: 8px 12px;
        }

        #walletList > div > input[type="checkbox"] {
            grid-row: span 2;
            align-self: start;
        }

        #walletList > div > div:first-of-type {
            grid-column: 2;
            grid-row: 1;
        }

        #walletList > div > div:nth-of-type(2) {
            font-size: 8px !important;
            color: gray;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        #walletList > div > span:last-child {
            grid-column: 3;
            grid-row: 1 / span 2;
            align-self: center;
            justify-self: end;
        }

        .wallet-add-btn {
            position: relative;
            bottom: 8px;
        }
    }
`
