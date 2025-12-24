let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let undoStack = [];           // STACK
let scheduledQueue = [];     // QUEUE

function save() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpense() {
    let title = document.getElementById("title").value;
    let amount = Number(document.getElementById("amount").value);
    let category = document.getElementById("category").value;

    if (!title || !amount) return alert("Fill all fields");

    let expense = { title, amount, category };

    expenses.push(expense);
    scheduledQueue.push(expense); // QUEUE usage

    save();
    render();
}

function deleteExpense(index) {
    let removed = expenses.splice(index, 1)[0];
    undoStack.push(removed); // STACK usage
    save();
    render();
}

function undoDelete() {
    if (undoStack.length === 0) return alert("Nothing to undo");
    expenses.push(undoStack.pop());
    save();
    render();
}

// QUICK SORT
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    let pivot = arr[0];
    let left = arr.slice(1).filter(e => e.amount <= pivot.amount);
    let right = arr.slice(1).filter(e => e.amount > pivot.amount);
    return [...quickSort(left), pivot, ...quickSort(right)];
}

function sortExpenses() {
    expenses = quickSort(expenses);
    save();
    render();
}

// HASH MAP
function categorySummary() {
    let map = {};
    expenses.forEach(e => {
        map[e.category] = (map[e.category] || 0) + e.amount;
    });

    let html = "<b>Category Summary:</b><br>";
    for (let key in map) {
        html += `${key}: ₹${map[key]}<br>`;
    }
    document.getElementById("categorySummary").innerHTML = html;
}

// QUEUE
function processScheduled() {
    if (scheduledQueue.length === 0) return alert("No scheduled expenses");
    alert("Processed: " + scheduledQueue.shift().title);
}

function render() {
    let list = document.getElementById("expenseList");
    list.innerHTML = "";

    let total = 0;
    expenses.forEach((e, i) => {
        total += e.amount;
        list.innerHTML += `
            <li>
                <span>${e.title} (${e.category}) - ₹${e.amount}</span>
                <button onclick="deleteExpense(${i})">X</button>
            </li>
        `;
    });

    document.getElementById("totalAmount").innerText = "₹" + total;
    document.getElementById("totalItems").innerText = expenses.length;
    categorySummary();
}

render();
let ctx = document.getElementById('categoryChart').getContext('2d');

// Prepare data
let categoryTotals = {};
expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
});

let labels = Object.keys(categoryTotals);
let data = Object.values(categoryTotals);

// Destroy previous chart if exists (important)
if (window.myPieChart) {
    window.myPieChart.destroy();
}

// Create new chart
window.myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: labels,
        datasets: [{
            label: 'Expenses by Category',
            data: data,
            backgroundColor: [
                '#FF9800', // Food
                '#2196F3', // Travel
                '#9C27B0', // Shopping
                '#9E9E9E'  // Other
            ],
            borderColor: '#fff',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label + ': ₹' + context.raw;
                    }
                }
            }
        }
    }
});
