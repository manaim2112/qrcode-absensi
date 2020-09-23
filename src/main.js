let resultContainer = document.getElementById('result');

if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    console.log("Memulai....");
} else {
    Swal.fire('Not Support', '', 'error');
}
/**
 * Mengecek Apakah ada data di localstorage
 */
let storage = localStorage.getItem('absensi');
if(!storage) { localStorage.setItem('absensi', JSON.stringify([])); }
  
/**
 * @function view
 * @param {*}  
 * Melihat data
 */
function view() {
    let result = '';

    JSON.parse(localStorage.getItem('absensi')).forEach((data) =>  {
        result  += `<tr><td>${data.id}</td><td>${data.name}</td><td>${data.in}</td><td>${data.out}</td><tr>`;
    })

    Swal.fire({
        title  :  'Absensi',
        html : `
            <table>
                <thead>
                    <tr>
                        <td> Kode </td>
                        <td> Nama </td>
                        <td> Masuk  </td>
                        <td>  Pulang </td>
                    </tr>
                </thead>
                <tbody>
                    ${result}
                </tbody>
            </table>`,
            width : "50%",
        showCancelButton : false,
        showCloseButton : true
    });
}
document.getElementById('viewButton').addEventListener('click', view);
/**
 * @function search
 * @param {*} id 
 * Mencari data dari kode (id) melalui localstorage
 * @return [true, false]
 */
function search(id) {
    storage = localStorage.getItem('absensi');
    let a = JSON.parse(storage),
        code = [];
    a.forEach(val => { code.push(parseInt(val.id))});
    if(code.indexOf(parseInt(id)) === -1) {
        return false;
    }
    a = a.filter((Obj) => { return parseInt(Obj.id) == parseInt(id) });

    return a[0];
}

/**
 * @function deleted
 * @param {*} id
 * Menambahkan data yang sudah keluar (data keluar)
 * @return html
 */
function deleted(id) {
    storage = localStorage.getItem('absensi');
    let a = JSON.parse(storage),
        b = a;
    
    a = a.filter((Obj) => { return parseInt(Obj.id) != parseInt(id); });
    b = b.filter((Obj) => { return parseInt(Obj.id) == parseInt(id); });
    let tanggal = new Date(),
        strDate = tanggal.toString().split(' ');
    b[0].out = strDate[4];
    a.push(b[0]);
    localStorage.setItem('absensi', JSON.stringify(a));
    Swal.fire({
        title :  `Berhasil Keluar...`,
        text : `Selamat beristirahat ${b[0].name}`,
        icon :  'success',
        showConfirmButton :  false,
        timer: 3000,
        timerProgressBar: true
    });
}

/**
 * @function push
 * @param {*} data
 * Menambahkan data kedalam localstorage
 * @return html
 */
function push(data) {
    let parse = JSON.parse(localStorage.getItem('absensi'));
    parse.push(data);
    localStorage.setItem('absensi', JSON.stringify(parse));
    Swal.fire({
        title :  `Selamat Datang ${data.name} !..`,
        text : 'Silahkan langsung masuk kelas :)',
        icon :  'success',
        showConfirmButton :  false,
        timer: 3000,
        timerProgressBar: true
    });
}

/**
 * @function onScanSuccess
 * @param {*} qrCodeMessage
 * Scan data melalui QRcode untuk diperoses 
 */
function onScanSuccess(qrCodeMessage) {
    let qrCodeData = JSON.parse(qrCodeMessage),
        cari = search(qrCodeData.id);

    if (cari) {
        if(cari.out.split('').length > 1) {
            return Swal.fire({
                title :  `Anda Sudah Keluar`,
                icon :  'info',
                showConfirmButton :  false,
                timer: 1000,
                timerProgressBar: true
            });
        }

        return Swal.fire({
            title : 'Opss!!... ',
            icon  : 'warning',
            text : 'Maaf anda sudah Masuk, ingin keluar ?',
            confirmButtonText : 'Keluar sekarang',
            showCancelButton : true,
            showCloseButton : true,
            timer: 3000,
            timerProgressBar: true
        }).then((result) => {

            if(result.isConfirmed) {
                return deleted(qrCodeData.id);

            }
        })
    }

    let tanggal = new Date(),
        strDate = tanggal.toString().split(' ');
        saving = {id : qrCodeData.id , name : qrCodeData.name , in : strDate[4], out : ''};
        
    return push(saving);        
}

/**
 * Configuration QRcode
 */
let html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);