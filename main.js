/*
 * main.js
 * 
 * Main javasscript executed for Jade Delight's order page. Opens new 
 * receipt page where only foods ordered will display.
 * 
 * Note: Original ordering form will clear after a valid submission.
 * 
 * Amy Bui
 * Comp20, Spring2021
 */

// Defined variables for receipt
const TAX = 0.0625;
var firstName   = "";
var lastName    = "";
var phoneNo     = "";
var getOption   = $("input[name='p_or_d']:checked").val();
var town        = "";   // city
var st          = "";   // street name
var waiting     = "";   // time until food is ready

/*
 * Automatically update order page as user selects food quantities
 * and chooses pickup/delivery.
 */
$(document).ready(
    function() {
        $("#error-order").hide();
        updateGetMethodsDisplay();
        updatePrices();
        updateGetMethod();
    }
);

/* restoreStyle
 *
 * Removes "required" class added as part of error message 
 * users see with invalid submissions, so they can see an updated display 
 * for their next submission attempt. 
 */
function restoreStyle() {
    inputNames = ["lname", "street", "city", "phone"];
    pKeyWord = ["Last Name", "Street", "City", "Phone"];
    for (let i = 0; i < inputNames.length; i++) {
        if ($("input[name='" + inputNames[i] + "']").hasClass("required")) {
            $("input[name='" + inputNames[i] + "']").removeClass("required");}
        
        if ($("p:contains(" + pKeyWord[i] + ")").hasClass("required")) {
            $("p:contains(" + pKeyWord[i] + ")").removeClass("required");}
    }
}

/* updatePrices
 *
 * Updates the Total Cost column of menue items as user updates
 * the quantity of each menu item they want, along with 
 * subtotal, tax, and total cost field.
 * 
 * Note: Only menu of food items are expected to correspond to 
 *      the selector elements referenced in this function, 
 *      ie the select tags with options selected, and 
 *      input tags with key name values of "cost". Uses set prices
 *      that were set in menuItems array (located in jade_delight.html).
 */
function updatePrices() {
    $("select").on("input", function() {
        var subTot = 0;
        $("select option:selected").each(function(idx) {
            let qty = $(this).val();
            let c = qty * menuItems[idx].cost;

            // update each Total Cost Field
            $("input[name='cost']:eq(" + idx + ")").attr("value", (c).toFixed(2));
            subTot += c;
        });
        MassTax = subTot * TAX;

        // update Subtotal, Tax, and Total
        $("input[name='subtotal']").attr("value", (subTot).toFixed(2));
        $("input[name='tax']").attr("value", (MassTax).toFixed(2));
        $("input[name='total']").attr("value", (subTot + MassTax).toFixed(2));
    });
}

/* updateGetMethod
 *
 * Determines when the pickup/delivery method is changed. 
 * Updates display on form accordingly
 * 
 */
function updateGetMethod() {
    $("input[name='p_or_d']").on("change", function() {
        getOption = $("input[name='p_or_d']:checked").val();
        updateGetMethodsDisplay();
    });
}

/* updateGetMethodsDisplay
 *
 * Determines city/street dislpay status based on pickup/delivery option.
 */
function updateGetMethodsDisplay() {
    if (getOption == "pickup") {
        $(".optional-display").hide();
    } else {
        $(".optional-display").show();
    }
}


/* formatTime
 * Returns a string that is some time additionalTime minutes from now. 
 * Time is in 12-Hour format: HH:MM (AM/PM)
 *
 */
function formatTime(additionalTime) {
    // get current time and calc. furture time. 
    var timeReady = new Date;
    timeReady.setMinutes(timeReady.getMinutes() + parseInt(additionalTime));

    // set 12 AM to be '12' and not '00'
    var hours = timeReady.getHours() % 12;
    hours = hours == 0 ? 12 : hours;

    // display two digit minute
    var minutes = timeReady.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes} ${timeReady.getHours() >= 12 ? 'PM' : 'AM'}`;
}

/* finishOrder
 * 
 * Sets pertinant information in localStorage to prepare to 
 * display user's order in a new window. order.html has onload 
 * function to execute.
 */
function finishOrder() {
    firstName = $("input[name='fname']").val();
    waiting = readyTime(getOption);

    // Pop up message upon finished order
    alert(`Hi, ${firstName}! Thanks for the order!. Your food will be ready in ${waiting} minutes!`);

    // Gather order information
    qtyList = new Array;        // qty of each item
    orderList = new Array;      // list of food ordered
    costList = new Array;       // list of each foods total cost
    var theSubtotal = 0;
    $("select option:selected").each(function(idx) {
        let qty = $(this).val();
        if (qty != 0) {             // will only display food that's ordered
            qtyList.push(qty);
            orderList.push(menuItems[idx].name);

            aCost = qty * menuItems[idx].cost;
            costList.push(aCost.toFixed(2));

            theSubtotal += aCost;       // calc subtotal
        }
    });

    var theTax = theSubtotal * TAX;         // calc tax
    var theTotal = theSubtotal + theTax;    // calc total

    // set all to local storage
    localStorage.setItem("qtyList", qtyList);
    localStorage.setItem("orderList", orderList);
    localStorage.setItem("costList", costList);

    localStorage.setItem("theSubtotal", theSubtotal.toFixed(2));
    localStorage.setItem("theTax", theTax.toFixed(2));
    localStorage.setItem("theTotal", theTotal.toFixed(2));

    localStorage.setItem("firstName", firstName);
    localStorage.setItem("waiting", waiting);
}

/* write Receipt
 * Formats and displays order information (costs, totals, Order ready time.)
 * Expected to display on separate page than the page that submitted order. 
 */
function writeReceipt(){
    // Get pertinant info from local storage
    qtyList     = localStorage.getItem("qtyList").split(',');
    orderList   = localStorage.getItem("orderList").split(',');
    costList    = localStorage.getItem("costList").split(',');
    theSubtotal = localStorage.getItem("theSubtotal");
    theTax      = localStorage.getItem("theTax");
    theTotal    = localStorage.getItem("theTotal");
    firstName   = localStorage.getItem("firstName");
    waitTime    = localStorage.getItem("waiting");

    // Calculate the time
    timeDisplay = formatTime(waitTime);

    // Format the displayed information on receipt
    orderDsiplay = "<div class='cookie'><ul id='order'>";
    costDisplay = "<ul id='cost'>";
    for (let i = 0; i < orderList.length; i++) {
        orderDsiplay += `<li>${qtyList[i]} x ${orderList[i]}</li>`;
        costDisplay += `<li>$${costList[i]}`;
    }
    orderDsiplay += "</ul>";
    costDisplay += "</ul></div>";

    // Format the tax and total
    totalDisplay = `<div class='cookie'><ul id='display'><li>Subtotal: </li><li>Mass tax 6.25%: </li><li>Total: </li></ul><ul id='totalCosts'><li>$${theSubtotal}</li><li>$${theTax}</li><li>$${theTotal}</li></ul></div>`;

    // Format the final message on receipt
    message = `<p>Hi, ${firstName}! Your food will be ready at ${timeDisplay}.</p>`

    // Write everything to order.html
    const receipt = document.querySelector("#receipt");
    receipt.innerHTML = orderDsiplay + costDisplay + totalDisplay + message;
}

/* validatePhone
 *
 * Confirms phone number is 10 digits long, OR a 1 followed by 10 digits
 */
function validatePhone(number){
    // declare reg exp for 10/11 digit phone number pattern
    let phone = /^1?\d{10}$/;

    if (number.match(phone)) {
        return true;
    } else {
        $("input[name='phone'], p:contains(Phone)").addClass("required");
        return false;
    }
}

/* titleCase
 *
 * Formats a string word to title case, ie capitalize the first letter. 
 * and returns it. I got the code from this site about setting cases 
 * with javascript/jquery:
 * cite: https://www.smartherd.com/convert-text-cases-using-jquery-without-css/
 */
function titleCase(word) {
    return word.toLowerCase().replace(/\b[a-z]/g, function(txtVal) {
        return txtVal.toUpperCase();
    });
}


/* checkFilled
 *
 * Confirms if content is not empty. Displays to user 
 * Red styling if content is empty.
 */
function checkFilled(content, conType) {
    if (content == "") {
        // Change style to show required fields
        $("input[name='" + conType + "']").addClass("required");

        if (conType == "lname") {
            $("p:contains(Last Name)").addClass("required");
        } else {
            $("p:contains(" + titleCase(conType) + ")").addClass("required");
        }

        return false;
    } else {
        return true;
    }

}

/* readyTime
 *
 * Returns time (min.) for food to be ready based on pickup or delivery
 */
function readyTime(getMethod) {
    if (getMethod == "pickup") {
        return 15;
    } else {    // delivery
        return 30;
    }
}

/* checkOrder
 *
 * Ensures user orders at least one item from menu.
 * 
 * Note: Only menu food items ar expected to be on form 
 *      and to correspond to select elements (in jade_delight.html)
 */
function checkOrder() {
    atLeastOne = false;
    $("select option:selected").each(function() {
        if ($(this).val() != 0)
            atLeastOne = true;    // at least one item is not 0 qty
    });

    if (!atLeastOne)    // display order requirement for 3 s.
        $("#error-order").fadeIn().delay(3000).fadeOut();

    return atLeastOne;
}

/*
 * Validate user input order information correctly. 
 * Must include: last name, phone (valid number), city/street (if delivery)
 * and at least 1 item ordered
 */
function validate() {
    restoreStyle();     // remove any error styling for next submission attempt

    lastName = $("input[name='lname']").val();
    phoneNo = $("input[name='phone']").val();

    var phoneValid = validatePhone(phoneNo);
    var lnameValid = checkFilled(lastName, "lname");
    var orderValid = checkOrder();
    var cityValid = true;
    var streetValid = true;

    if (getOption == "delivery") {
        town = $("input[name='city']").val();
        st = $("input[name='street']").val();

        cityValid = checkFilled(town, "city");
        streetValid = checkFilled(st, "street");
    }

    // Confirm all checks were valid.
    if (phoneValid && lnameValid && orderValid && cityValid && streetValid) {
        finishOrder();
        return true;
    } else {
        return false;
    }
}