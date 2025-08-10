const scriptURL = 'https://script.google.com/macros/s/AKfycbxl9sCr87mDlvyqinjxD_26tTJEKn2-ImVVrL-yAAhCg-Sta_56csrptpcQ6Q_9dy35/exec'
        const form = document.forms['submit-to-google-sheet']
        const msg = document.getElementById("msg");
        const load = document.getElementById("load");
        const b = document.getElementById("submit_btn");
        form.addEventListener('submit', e => {
            e.preventDefault()
            load.style.display = "flex";
            b.style.background = "gray";
            b.style.cursor = "not-allowed";
            fetch(scriptURL, { method: 'POST', body: new FormData(form)})
                .then(response => {
                    load.style.display = "none";
                    msg.innerHTML = "Submitted Successfully"
                    msg.style.backgroundColor = "green";
                    setTimeout(function(){
                        msg.innerHTML = ""
                        msg.style.backgroundColor = "#ffffff00";
                    }, 5000)
                    form.reset()
                    b.style.background = "#ff2424";
                    b.style.cursor = "default";
                })
                .catch(error => console.error('Error!', error.message))
        });