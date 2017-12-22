var InvoiceTable = (function InvoiceTable() {
    //DOM selectors
    var tableHeadersElement = $("#invoices-table thead");
    var tableRowsElement = $("#invoices-table tbody");
    var tableInfo = $("#invoices-table .info");
    var addInvoiceButton = $("#addInvoice");
    //Consts initialisation
    var invoicesData = [];
    var formatter = new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency: "lei",
        minimumFractionDigits: 4
    });

    //Invoice Table API
    return {
        init: initInvoiceTable
    };

    function initHeaders(headers) {
        tableHeadersElement.html(function() {
            return headers.map(function(element) {
                var sortingAttributeValue =
                    element.length === 0 ? "" : "data-ascending=none";
                return (
                    '<th scope="col" ' + sortingAttributeValue + ">" + element + "</th>"
                );
            });
        });
    }

    function initRows(data) {
        tableRowsElement.html(function() {
            return data.map(function(entry, index) {
                return parseRow(entry, index);
            });
        });
    }

    function parseRow(entry, index) {
        var rowHTML = "<tr><td> <input type='checkbox' id=" + index + "/></td>";
        rowHTML += Object.values(entry)
            .map(function(columnValue) {
                var value = isNumber(columnValue) ?
                    formatter.format(columnValue) :
                    columnValue;
                return "<td>" + value + "</td>";
            })
            .join("");
        rowHTML += "</tr>";
        return rowHTML;
    }

    function initInvoiceTable() {
        $.getJSON("data.json")
            .fail(function(err) {
                console.log("data could not be loaded");
            })
            .done(function(data) {
                invoicesData = data;
                initRows(invoicesData);
                initHeaders([""].concat(Object.keys(invoicesData[0])));
                displayInfo("", "");
            })
            .always(function() {
                //set loading to false
            });
        addEventListeners();
    }

    function isDate(value) {
        return !isNaN(Date.parse(value));
    }

    function isNumber(value) {
        return !isNaN(Number(value));
    }

    function displayInfo(sortingColumn, direction) {
        tableInfo.html(
            "Showing " +
            invoicesData.length +
            " out of " +
            invoicesData.length +
            " Sorted by " +
            sortingColumn +
            "  " +
            direction
        );
    }

    function sortColumn(data, byKey, isAscending) {
        return data.sort(function(a, b) {
            // if (!a[byKey] && !b[byKey]) return null;
            var testDate = isDate(a[byKey]);
            var testNumeric = isNumber(a[byKey]);
            if (testDate) {
                var result = isAscending ?
                    moment(a[byKey], "DD/MM/YYYY") - moment(b[byKey], "DD/MM/YYYY") :
                    moment(b[byKey], "DD/MM/YYYY") - moment(a[byKey], "DD/MM/YYYY");
            } else if (testNumeric) {
                var result = isAscending ?
                    Number(a[byKey]) - Number(b[byKey]) :
                    Number(b[byKey]) - Number(a[byKey]);
            } else {
                var result = isAscending ?
                    a[byKey].localeCompare(b[byKey]) :
                    b[byKey].localeCompare(a[byKey]);
            }
            return result;
        });
    }

    function addEventListeners() {
        //add click event listeners  for selecting current row
        tableRowsElement.delegate(
            "input[type='checkbox']",
            "click",
            selectRowFromCheckbox
        );
        tableRowsElement.delegate("tr", "click", selectRow);
        //add click event listener on headers for sorting purposes
        tableHeadersElement.delegate(":not(th:first-child)", "click", sort);
        addInvoiceButton.on("click", function() {
            $("#invoiceModal").modal("show");
        });

        function sort() {
            //reset sorting icon on the remaining headers
            tableHeadersElement
                .find(":not(th:first-child)")
                .not($(this))
                .attr("data-ascending", "none");
            //toggle sorting direction on clicked column
            var isAscending =
                $(this).attr("data-ascending") === "none" ||
                $(this).attr("data-ascending") === "true" ?
                false :
                true;
            $(this).attr("data-ascending", isAscending);
            //sort the data and redisplay it
            invoicesData = sortColumn(invoicesData, $(this).text(), isAscending);
            initRows(invoicesData);
            //update sorted by info
            displayInfo($(this).text(), isAscending ? "asc" : "desc");
        }

        function selectRow(e) {
            $(this).toggleClass("selected");
            var checkbox = $(this).find("input[type='checkbox']");
            checkbox.prop("checked", !checkbox.prop("checked"));
        }

        function selectRowFromCheckbox(e) {
            e.stopPropagation();
            $(this)
                .parents()
                .closest("tr")
                .toggleClass("selected");
        }
    }
})();