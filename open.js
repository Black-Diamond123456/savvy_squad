let individuals = []
function addDetails() {
    let name = document.getElementById("addName").value.trim();
    let age = Number(document.getElementById("ageNo").value);
    let hobby = document.getElementById("hobbyType").value.trim();
    let country = document.getElementById("countryName").value.trim();
    let something = document.getElementById("someThing").value.trim();
    let mediaFile = document.getElementById("mediaUpload").file[0]
    if (name === "" || age === "" || hobby === "" || country === "") {
        alert("All fields are required");
        return
    };
    if (age !== "" && (Number(age) <= 0 || Number(age) > 50)) {
        alert("Enter a valid age");
        return;
    };
    if (hobby.length > 50) {
        alert("Hobby/bio is too long")
        return;
    }
    individuals.push({
        name: name,
        age: age,
        hobby: hobby,
        country: country,
        something: something === "" ? "Not provided" : something,
        media: mediaFile ? mediaFile.name : "No file uploaded"
    }),
        document.getElementById("addName").value = "";
    document.getElementById("ageNo").value = "";
    document.getElementById("hobbyType").value = "";
    document.getElementById("countryName").value = "";
    document.getElementById("someThing").value = "";
    document.getElementById("mediaUpload").value = "";
    showSuccessPopup();
}
function showSuccessPopup() {
    let popup = document.getElementById("successPopup");
    popup.style.display = "block";
    setTimeout(function () {
        popup.style.display = "none"
    }, 2000);
}