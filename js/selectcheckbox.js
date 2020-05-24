let expanded = false;

function showCheckboxes() {
    var checkboxes = document.querySelector("div#chkDados")
    if (!expanded) {
        checkboxes.style.display = "block"
        expanded = true
    } else {
        checkboxes.style.display = "none"
        expanded = false
    }
}