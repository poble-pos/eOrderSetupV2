const API_BASE = "http://localhost:8090/api/Report";

let currentReport = "summary";
let currentData = null;

const reportTitles = {
    summary: "Sales Summary",
    "item-sales": "Item Sales",
    orders: "Orders",
    customers: "Customer Groups",
    "meal-period": "Sales by Meal Period",
    "daily-sales": "Daily Sales",
    "cashier-registers": "Cashier Registers",
    "HungryBear": "Hungry Bear Takeaway/Dine In"
};

const endpoints = {
    summary: "current-sales-summary",
    "item-sales": "item-sales",
    orders: "orderMaster",
    customers: "customerGroupRatio",
    "meal-period": "salesByMealPeriod",
    "daily-sales": "dailySalesByMeal",
    "cashier-registers": "pos-cashier-register",
    "hungry-bear": "hungryBearSalesByTag"
};

/* --------------------------------------------------
   Initialization
-------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    initializeDates();

    document
        .getElementById("searchButton")
        .addEventListener("click", loadCurrentReport);

    document
        .getElementById("downloadCsvButton")
        .addEventListener("click", downloadCsv);

    document
        .querySelectorAll(".tab")
        .forEach(tab => {

            tab.addEventListener("click", () => {

                currentReport =
                    tab.dataset.report;

                document
                    .querySelectorAll(".tab")
                    .forEach(x =>
                        x.classList.remove("active")
                    );

                tab.classList.add("active");

                document
                    .getElementById("reportTitle")
                    .textContent =
                        reportTitles[currentReport];

                loadCurrentReport();
            });
        });

    loadCurrentReport();
});


/* --------------------------------------------------
   Dates
-------------------------------------------------- */

function initializeDates() {

    const now = new Date();

    const firstDay =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

    document.getElementById("startDate").value =
        formatDate(now);

    document.getElementById("endDate").value =
        formatDate(now);
}


function formatDate(date) {

    return date.toISOString()
        .substring(0, 10);
}


/* --------------------------------------------------
   API
-------------------------------------------------- */

async function loadCurrentReport() {

    const startDate =
        document.getElementById("startDate").value;

    const endDate =
        document.getElementById("endDate").value;

    if (!startDate || !endDate) {
        showError("Please select start and end dates.");
        return;
    }

    showLoading(true);
    clearError();

    try {

        const url =
            `${API_BASE}/${endpoints[currentReport]}` +
            `?startDate=${encodeURIComponent(startDate)}` +
            `&endDate=${encodeURIComponent(endDate)}`;

        console.log("Request:", url);

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `API returned ${response.status}`
            );
        }

        currentData =
            await response.json();

        renderCurrentReport();

    }
    catch (error) {

        console.error(error);

        showError(
            `Failed to load report: ${error.message}`
        );

        document
            .getElementById("reportContent")
            .innerHTML = "";
    }
    finally {

        showLoading(false);
    }
}


/* --------------------------------------------------
   Rendering
-------------------------------------------------- */

function renderCurrentReport() {

    switch (currentReport) {

        case "summary":
            renderSummary();
            break;

        case "item-sales":
            renderItemSales();
            break;

        case "orders":
            renderOrders();
            break;

        case "customers":
            renderCustomers();
            break;

        case "meal-period":
            renderMealPeriod();
            break;

        case "daily-sales":
            renderDailySales();
            break;

        case "cashier-registers":
            renderCashierRegisters();
            break;

        case "hungry-bear":
            renderHungryBear();
            break;
    }
}


/* --------------------------------------------------
   Summary
-------------------------------------------------- */

function renderSummary() {

    const data = currentData;

    if (!data) {
        return;
    }

    const total =
        data.total || {};

    const delivery =
        data.delivery || {};

    document.getElementById("reportContent").innerHTML = `

        <div class="cards">

            ${metricCard(
                "Net Sales",
                money(total.netSales)
            )}

            ${metricCard(
                "Gross Sales",
                money(total.grossSales)
            )}

            ${metricCard(
                "Orders",
                number(total.totalOrders)
            )}

            ${metricCard(
                "Customers",
                number(total.totalCustomers)
            )}

        </div>


        <div class="panel-grid">

            <div class="panel">

                <div class="panel-header">
                    Sales Summary
                </div>

                <div class="panel-body">

                    <table class="summary-table">

                        ${summaryRow(
                            "Settled",
                            money(
                                data.settled?.netSales
                            )
                        )}

                        ${summaryRow(
                            "Unsettled",
                            money(
                                data.unsettled?.netSales
                            )
                        )}

                        ${summaryRow(
                            "Gross Sales",
                            money(total.grossSales)
                        )}

                        ${summaryRow(
                            "Discount",
                            money(total.totalDiscount)
                        )}

                        ${summaryRow(
                            "Surcharge",
                            money(total.totalSurcharge)
                        )}

                        ${summaryRow(
                            "Net Sales",
                            money(total.netSales)
                        )}

                        ${summaryRow(
                            "Total Paid",
                            money(total.totalPaid)
                        )}

                        ${summaryRow(
                            "Total Due",
                            money(total.totalDue)
                        )}

                    </table>

                </div>

            </div>


            <div class="panel">

                <div class="panel-header">
                    Payment Methods
                </div>

                <div class="panel-body">

                    <table class="summary-table">

                        ${summaryRow(
                            "Cash",
                            money(total.cash)
                        )}

                        ${summaryRow(
                            "EFTPOS",
                            money(total.eftpos)
                        )}

                        ${summaryRow(
                            "Credit",
                            money(total.credit)
                        )}

                        ${summaryRow(
                            "Others",
                            money(total.others)
                        )}

                        ${summaryRow(
                            "Refund Cash",
                            money(total.refundCash)
                        )}

                        ${summaryRow(
                            "Refund Other",
                            money(total.refundOther)
                        )}

                    </table>

                </div>

            </div>

        </div>


        <div class="panel">

            <div class="panel-header">
                Delivery Sales
            </div>

            <div class="panel-body">

                <div class="delivery-grid">

                    ${deliveryItem(
                        "Uber Eats",
                        delivery.uberEats
                    )}

                    ${deliveryItem(
                        "Menulog",
                        delivery.menulog
                    )}

                    ${deliveryItem(
                        "Deliveroo",
                        delivery.deliveroo
                    )}

                    ${deliveryItem(
                        "EASI",
                        delivery.easi
                    )}

                    ${deliveryItem(
                        "DoorDash",
                        delivery.doorDash
                    )}

                    ${deliveryItem(
                        "Hungry Panda",
                        delivery.hungryPanda
                    )}

                    ${deliveryItem(
                        "ShopBack",
                        delivery.shopBack
                    )}

                    ${deliveryItem(
                        "Stripe",
                        delivery.stripe
                    )}

                    ${deliveryItem(
                        "Other",
                        delivery.other
                    )}

                    ${deliveryItem(
                        "Total Delivery",
                        delivery.totalDelivery
                    )}

                    ${deliveryItem(
                        "Included Sales",
                        delivery.deliveryIncludedSales
                    )}

                </div>

            </div>

        </div>
    `;
}


/* --------------------------------------------------
   Item Sales
-------------------------------------------------- */

function renderItemSales() {

    const rows =
        Array.isArray(currentData)
            ? currentData
            : [];

    const columns = [
        {
            key: "categoryName",
            label: "Category"
        },
        {
            key: "menuItemId",
            label: "Item ID"
        },
        {
            key: "menuItemName",
            label: "Menu Item"
        },
        {
            key: "quantitySold",
            label: "Quantity"
        },
        {
            key: "totalSales",
            label: "Sales"
        }
    ];

    renderTable(rows, columns);
}


/* --------------------------------------------------
   Orders
-------------------------------------------------- */

function renderOrders() {

    const rows =
        Array.isArray(currentData)
            ? currentData
            : [];

    const columns = [

        {
            key: "orderID",
            label: "Order ID"
        },

        {
            key: "openOrderTime",
            label: "Open Time"
        },

        {
            key: "orderType",
            label: "Order Type"
        },

        {
            key: "tableTag",
            label: "Table"
        },

        {
            key: "customerName",
            label: "Customer"
        },

        {
            key: "totalEntryAmount",
            label: "Amount"
        },

        {
            key: "totalPaidAmount",
            label: "Paid"
        },

        {
            key: "orderStatus",
            label: "Status"
        },

        {
            key: "isSettleOrder",
            label: "Settled"
        }

    ];

    renderTable(rows, columns);
}


/* --------------------------------------------------
   Customers
-------------------------------------------------- */

function renderCustomers() {

    const data =
        Array.isArray(currentData)
            ? currentData[0]
            : currentData;

    if (!data) {
        return;
    }

    document.getElementById("reportContent").innerHTML = `

        <div class="cards">

            ${metricCard(
                "Total Groups",
                number(data.totalGroups)
            )}

            ${metricCard(
                "1 Customer",
                ratio(
                    data.group1Ratio
                )
            )}

            ${metricCard(
                "2 Customers",
                ratio(
                    data.group2Ratio
                )
            )}

            ${metricCard(
                "3 Customers",
                ratio(
                    data.group3Ratio
                )
            )}

        </div>

        <div class="panel">

            <div class="panel-header">
                Customer Group Distribution
            </div>

            <div class="panel-body">

                <table>

                    <thead>

                        <tr>
                            <th>Group</th>
                            <th class="number">Count</th>
                            <th class="number">Ratio</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${customerGroupRow(
                            "1",
                            data.group1Count,
                            data.group1Ratio
                        )}

                        ${customerGroupRow(
                            "2",
                            data.group2Count,
                            data.group2Ratio
                        )}

                        ${customerGroupRow(
                            "3",
                            data.group3Count,
                            data.group3Ratio
                        )}

                        ${customerGroupRow(
                            "4",
                            data.group4Count,
                            data.group4Ratio
                        )}

                        ${customerGroupRow(
                            "5",
                            data.group5Count,
                            data.group5Ratio
                        )}

                        ${customerGroupRow(
                            "6",
                            data.group6Count,
                            data.group6Ratio
                        )}

                        ${customerGroupRow(
                            "7",
                            data.group7Count,
                            data.group7Ratio
                        )}

                        ${customerGroupRow(
                            "8+",
                            data.group8PlusCount,
                            data.group8PlusRatio
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


/* --------------------------------------------------
   Meal Period
-------------------------------------------------- */

function renderMealPeriod() {

    const rows =
        Array.isArray(currentData)
            ? currentData
            : [];

    const columns = [

        {
            key: "mealType",
            label: "Meal"
        },

        {
            key: "salesAmount",
            label: "Sales"
        },

        {
            key: "customerCount",
            label: "Customers"
        },

        {
            key: "tableCount",
            label: "Tables"
        },

        {
            key: "avgTableAmount",
            label: "Avg Table"
        },

        {
            key: "avgCustomerAmount",
            label: "Avg Customer"
        }

    ];

    renderTable(rows, columns);
}


/* --------------------------------------------------
   Daily Sales
-------------------------------------------------- */

function renderDailySales() {

    const rows =
        Array.isArray(currentData)
            ? currentData
            : [];

    if (rows.length === 0) {
        document.getElementById("reportContent").innerHTML =
            `<div class="panel">
                <div class="panel-body">
                    No data available.
                </div>
            </div>`;
        return;
    }

    const grouped = {};

    rows.forEach(row => {

        const date =
            row.businessDate.substring(0, 10);

        if (!grouped[date]) {
            grouped[date] = 0;
        }

        grouped[date] +=
            Number(row.salesAmount || 0);
    });

    const values =
        Object.entries(grouped);

    const max =
        Math.max(
            ...values.map(x => x[1]),
            1
        );

    const bars =
        values.map(([date, amount]) => {

            const height =
                Math.max(
                    (amount / max) * 100,
                    2
                );

            return `
                <div
                    class="bar"
                    style="height:${height}%"
                    title="${date}: ${money(amount)}"
                >
                    <div class="bar-label">
                        ${date.substring(8)}
                    </div>
                </div>
            `;
        }).join("");

    document.getElementById("reportContent").innerHTML = `

        <div class="panel">

            <div class="panel-header">
                Daily Sales
            </div>

            <div class="panel-body">

                <div class="chart-container">

                    <div class="bar-chart">
                        ${bars}
                    </div>

                </div>

            </div>

        </div>

        <br>

        <div class="table-wrapper">

            <table>

                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Meal</th>
                        <th class="number">Sales</th>
                        <th class="number">Customers</th>
                        <th class="number">Tables</th>
                        <th class="number">Avg Table</th>
                        <th class="number">Avg Customer</th>
                    </tr>
                </thead>

                <tbody>

                    ${rows.map(row => `
                        <tr>

                            <td>
                                ${formatDateTime(
                                    row.businessDate
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    row.mealType
                                )}
                            </td>

                            <td class="number">
                                ${money(
                                    row.salesAmount
                                )}
                            </td>

                            <td class="number">
                                ${number(
                                    row.customerCount
                                )}
                            </td>

                            <td class="number">
                                ${number(
                                    row.tableCount
                                )}
                            </td>

                            <td class="number">
                                ${money(
                                    row.avgTableAmount
                                )}
                            </td>

                            <td class="number">
                                ${money(
                                    row.avgCustomerAmount
                                )}
                            </td>

                        </tr>
                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* --------------------------------------------------
   Cashier Registers
-------------------------------------------------- */

function renderCashierRegisters() {

    const rows =
        Array.isArray(currentData)
            ? currentData
            : [];

    const columns = [

        {
            key: "posCashierRegisterID",
            label: "Register ID"
        },

        {
            key: "posID",
            label: "POS"
        },

        {
            key: "openTime",
            label: "Open Time"
        },

        {
            key: "openAmount",
            label: "Open Amount"
        },

        {
            key: "closeTime",
            label: "Close Time"
        },

        {
            key: "closeCashAmount",
            label: "Close Cash"
        },

        {
            key: "closeOtherAmount",
            label: "Close Other"
        },

        {
            key: "differenceAmount",
            label: "Difference"
        },

        {
            key: "isClose",
            label: "Closed"
        }

    ];

    renderTable(rows, columns);
}


/* --------------------------------------------------
   Hungry Bear
-------------------------------------------------- */

function renderHungryBear() {

    const rows =
        Array.isArray(currentData)
            ? currentData
            : [];

    const tableOrders = rows.reduce(
        (sum, row) => sum + Number(row.tableOrderCount || 0),
        0
    );

    const takeawayOrders = rows.reduce(
        (sum, row) => sum + Number(row.takeawayOrderCount || 0),
        0
    );

    const totalOrders =
        tableOrders + takeawayOrders;

    const tableRatio =
        totalOrders > 0
            ? (tableOrders / totalOrders) * 100
            : 0;

    const takeawayRatio =
        totalOrders > 0
            ? (takeawayOrders / totalOrders) * 100
            : 0;

    const tableSales = rows.reduce(
            (sum, row) => sum + Number(row.tableSalesAmount || 0),
            0
        );

    const takeawaySales = rows.reduce(
        (sum, row) => sum + Number(row.takeawaySalesAmount || 0),
        0
        );
    const totalSales =
        tableSales + takeawaySales;

    const content =
        document.getElementById("reportContent");

    content.innerHTML = `

        <div class="hungry-bear-summary">

            <div class="report-card">
                <div class="report-card-label">
                    Total Orders
                </div>
                <div class="report-card-value">
                    ${totalOrders.toLocaleString()}
                    <span class="report-card-sub">
                        (${money(totalSales)})
                    </span>
                </div>
            </div>

            <div class="report-card">
                <div class="report-card-label">
                    Table Orders
                </div>
                <div class="report-card-value">
                    ${tableOrders.toLocaleString()}
                    <span class="report-card-sub">
                    (${money(tableSales)})
                </span>
                </div>
                <div class="report-card-sub">
                    ${tableRatio.toFixed(1)}%
                </div>
            </div>

            <div class="report-card">
                <div class="report-card-label">
                    Takeaway Orders
                </div>
                <div class="report-card-value">
                    ${takeawayOrders.toLocaleString()}
                    <span class="report-card-sub">
                        (${money(takeawaySales)})
                    </span>
                </div>
                <div class="report-card-sub">
                    ${takeawayRatio.toFixed(1)}%
                </div>
            </div>

        </div>


        <div class="report-panel">

            <div class="report-panel-header">
                <h3>Hungry Bear Order Ratio</h3>
            </div>

            <div class="hungry-bear-chart">

                <div
                    class="hungry-bear-pie"
                    style="
                        background: conic-gradient(
                            #4f46e5 0% ${tableRatio}%,
                            #f59e0b ${tableRatio}% 100%
                        );
                    ">
                </div>

                <div class="hungry-bear-legend">

                    <div class="hungry-bear-legend-item">

                        <span
                            class="legend-dot"
                            style="background:#4f46e5">
                        </span>

                        <div>
                            <strong>Table Orders</strong>
                            <span>
                                ${tableOrders.toLocaleString()}
                                (${tableRatio.toFixed(1)}%)
                            </span>
                        </div>

                    </div>


                    <div class="hungry-bear-legend-item">

                        <span
                            class="legend-dot"
                            style="background:#f59e0b">
                        </span>

                        <div>
                            <strong>Takeaway Orders</strong>
                            <span>
                                ${takeawayOrders.toLocaleString()}
                                (${takeawayRatio.toFixed(1)}%)
                            </span>
                        </div>

                    </div>

                </div>

            </div>

        </div>


        <div class="report-panel">

            <div class="report-panel-header">
                <h3>Daily Orders</h3>
            </div>

            <div id="hungryBearTable"></div>

        </div>
    `;


    const columns = [

    {
        key: "businessDate",
        label: "Date"
    },

    {
        key: "tableOrderCount",
        label: "Table Orders"
    },

    {
        key: "tableSalesAmount",
        label: "Table Sales"
    },

    {
        key: "takeawayOrderCount",
        label: "Takeaway Orders"
    },

    {
        key: "takeawaySalesAmount",
        label: "Takeaway Sales"
    }

];

    renderTable(
        rows,
        columns,
         "hungryBearTable"
    );
}

/* --------------------------------------------------
   Generic Table
-------------------------------------------------- */

function renderTable(rows, columns,targetId = "reportContent") {

    const html = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        ${columns.map(column =>
                            `<th>${column.label}</th>`
                        ).join("")}

                    </tr>

                </thead>

                <tbody>

                    ${
                        rows.length === 0

                        ? `
                            <tr>
                                <td
                                    colspan="${columns.length}"
                                    style="text-align:center"
                                >
                                    No data available.
                                </td>
                            </tr>
                          `

                        : rows.map(row => `

                            <tr>

                                ${
                                    columns.map(column => {

                                        let value =
                                            row[column.key];

                                        if (
                                            value === null ||
                                            value === undefined
                                        ) {
                                            value = "";
                                        }

                                        if (
                                            column.key
                                                .toLowerCase()
                                                .includes("amount") ||
                                            column.key
                                                .toLowerCase()
                                                .includes("sales") ||
                                            column.key
                                                .toLowerCase()
                                                .includes("price")
                                        ) {
                                            value = money(Number(value) || 0);
                                        }

                                        return `
                                            <td>
                                                ${escapeHtml(
                                                    String(value)
                                                )}
                                            </td>
                                        `;

                                    }).join("")
                                }

                            </tr>

                        `).join("")
                    }

                </tbody>

            </table>

        </div>
    `;

    document
        .getElementById(targetId)
        .innerHTML = html;
}


/* --------------------------------------------------
   CSV
-------------------------------------------------- */

function downloadCsv() {

    if (!currentData) {
        return;
    }

    let rows = [];

    if (Array.isArray(currentData)) {
        rows = currentData;
    }
    else {
        rows = flattenObjectForCsv(currentData);
    }

    if (!rows || rows.length === 0) {
        alert("No data available for export.");
        return;
    }

    const csv =
        convertToCsv(rows);

    const blob =
        new Blob(
            ["\ufeff" + csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `${currentReport}-${getTodayString()}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


function convertToCsv(rows) {

    const columns =
        Object.keys(rows[0]);

    const header =
        columns.map(csvEscape).join(",");

    const body =
        rows.map(row =>
            columns
                .map(column =>
                    csvEscape(row[column])
                )
                .join(",")
        );

    return [
        header,
        ...body
    ].join("\n");
}


function csvEscape(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const text =
        String(value)
            .replace(/"/g, '""');

    return `"${text}"`;
}


/*
 * Summary object는 그대로 CSV로 만들기보다
 * 각 block을 하나의 row로 변환합니다.
 */
function flattenObjectForCsv(data) {

    if (
        data.total &&
        data.settled &&
        data.unsettled
    ) {

        return [
            {
                section: "Settled",
                ...data.settled
            },

            {
                section: "Unsettled",
                ...data.unsettled
            },

            {
                section: "Total",
                ...data.total
            }
        ];
    }

    return [data];
}


/* --------------------------------------------------
   UI helpers
-------------------------------------------------- */

function metricCard(label, value) {

    return `
        <div class="card">

            <div class="card-label">
                ${label}
            </div>

            <div class="card-value">
                ${value}
            </div>

        </div>
    `;
}


function summaryRow(label, value) {

    return `
        <tr>

            <td>
                ${label}
            </td>

            <td>
                ${value}
            </td>

        </tr>
    `;
}


function deliveryItem(label, value) {

    return `
        <div class="delivery-item">

            <div class="delivery-name">
                ${label}
            </div>

            <div class="delivery-value">
                ${money(value)}
            </div>

        </div>
    `;
}


function customerGroupRow(
    group,
    count,
    ratioValue
) {

    return `
        <tr>

            <td>
                ${group}
            </td>

            <td class="number">
                ${number(count)}
            </td>

            <td class="number">
                ${ratio(ratioValue)}
            </td>

        </tr>
    `;
}


/* --------------------------------------------------
   Formatting
-------------------------------------------------- */

function money(value) {

    const numberValue =
        Number(value || 0);

    return numberValue.toLocaleString(
        "en-AU",
        {
            style: "currency",
            currency: "AUD"
        }
    );
}


function number(value) {

    return Number(value || 0)
        .toLocaleString("en-AU");
}


function ratio(value) {

    const n =
        Number(value || 0);

    /*
     * API가 0.25를 반환하는 경우
     * 25%로 표시합니다.
     *
     * 만약 API가 이미 25를 반환한다면
     * 이 부분을 수정하면 됩니다.
     */
    const percentage =
        n <= 1
            ? n * 100
            : n;

    return `${percentage.toFixed(1)}%`;
}


function formatDateTime(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-AU");
}


function getTodayString() {

    return new Date()
        .toISOString()
        .substring(0, 10);
}


/* --------------------------------------------------
   Security
-------------------------------------------------- */

function escapeHtml(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* --------------------------------------------------
   Loading / Error
-------------------------------------------------- */

function showLoading(show) {

    document
        .getElementById("loading")
        .classList.toggle(
            "hidden",
            !show
        );
}


function showError(message) {

    const element =
        document.getElementById("error");

    element.textContent =
        message;

    element.classList.remove("hidden");
}


function clearError() {

    document
        .getElementById("error")
        .classList.add("hidden");
}