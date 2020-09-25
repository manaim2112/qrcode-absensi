let resultContainer = document.getElementById('result');

if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    console.log("Memulai....");
} else {
    Swal.fire('Not Support', '', 'error');
}
// Toast
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});
/**
 * Mengecek Apakah ada data di localstorage
 */
let storage = localStorage.getItem('absensi'),
    refresh = localStorage.getItem('refresh');
if(!storage) { localStorage.setItem('absensi', JSON.stringify([])); }
if(!refresh) { localStorage.setItem('refresh', new Date().setHours(6, 0, 0, 0)); }


/**
 * @function  exportToExcel
 * @param {*} data 
 * Convert Data with LocalStorage to Excel format *.XLSX
 */
function exportToExcel(data) {
    var wb = XLSX.utils.book_new();
    var ws_name = "absensi";

    /* make worksheet */
    var ws_data = [[ "no", "kode", "nama", "masuk", "keluar"]];

    data.forEach((value, key) => {
        ws_data.push([key, value.id, value.name, value.in, value.out]);
    });
    ws_data.push([]);
    ws_data.push(['rilis', new Date().toJSON().split('T')[0], '', '']);
    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    /* Add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    /* bookType can be any supported output type */
    var wopts = { bookType:'xlsx', bookSST:false, type:'array' };

    var wbout = XLSX.write(wb,wopts);

    /* the saveAs call downloads a file on the local machine */
    let nameFile = new Date().toJSON().split('T')[0] +  '.absensi.xlsx';
    saveAs(new Blob([wbout],{type:"application/octet-stream"}), nameFile);
    localStorage.setItem('refresh', new Date().setHours(6, 0, 0, 0));
}
/**
 * @function view
 * @param {*}  
 * Melihat data
 */
function view() {
    let result = '';

    let datas = JSON.parse(localStorage.getItem('absensi'));
    datas = datas.sort((a, b)  => { return a.id - b.id; });

    datas.forEach((data) =>  {
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
        showCloseButton : true,
        showDenyButton: true,
        confirmButtonText : 'Export to Excel',
        denyButtonText : 'Hapus Data'
    }).then((result) => {
        if(result.isConfirmed) {
            console.log('download...');
            return exportToExcel(datas);
        }
        if(result.isDenied) {
            Swal.fire({
                icon : 'warning',
                title : 'Yakin Ingin Hapus ?' 
            }).then((response) => {
                if(response.isConfirmed) {
                    localStorage.setItem('absensi', '[]');
                    return Toast.fire({ icon : 'success', title : 'Berhasil dihapus...'});
                }
            })
        }
    })
}

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
        timerProgressBar: true,
        position  : 'bottom-end'
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
        timerProgressBar: true,
        position  : 'bottom-end'
    });
}

function close() {

    
}

/**
 * @function onScanSuccess
 * @param {*} qrCodeMessage
 * Scan data melalui QRcode untuk diperoses 
 */
let timing = 6;
function onScanSuccess(qrCodeMessage) {
    let qrCodeData = JSON.parse(qrCodeMessage),
        cari = search(qrCodeData.id);

    if (cari) {

        // // Jika secure tidak sama
        // fetch('../data.json').then(res => res.json()).then((event) => {
        //     if(cari.secure !== event.secure) {
        //         return Swal.fire({
        //             title : 'QRcode Salah !!...',
        //             text : 'Pastikan menggunakan QRcode yang benar',
        //             icon : 'error',
        //             showConfirmButton : false,
        //             timer : 1000,
        //             timerProgressBar : true
        //         });
        //     }

        // });

        // Jika data out sudah ada
        if(cari.out.split('').length > 1) {
            return Swal.fire({
                title :  `Anda Sudah Keluar`,
                icon :  'info',
                showConfirmButton :  false,
                timer: 1000,
                timerProgressBar: true
            });
        }

        // Automatic Keluar
        let session = sessionStorage.getItem('out');
        if(!session) { 
            sessionStorage.setItem('out', Date.parse(new Date()) + 5*1000);
        }
        
        timing -= 1;
        if(sessionStorage.getItem('out') < Date.parse(new Date())) {
            if(timing == 0) {
                timing = 6;
                return deleted(qrCodeData.id);
            }
            sessionStorage.removeItem('out');
        }
    
        return Swal.fire({
            title : 'Anda Sudah Masuk ',
            icon  : 'info',
            html :  `<br><strong> Ingin Keluar ? </strong>` + cari.name,
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
 * @function autorefresh
 * @param {*} data 
 * @return download For excel AutoMatic
 */
function autorefresh(data) {
    let dateNow = Date.parse(new Date());
    fetch('../data.json').then(res => res.json()).then((event) => {
        let different = dateNow - data;
        if(different > event.refresh) {
            let datas = JSON.parse(localStorage.getItem('absensi'));
            if(datas.length > 0) {
                return exportToExcel(datas);
            }
        }

    });
}


/**
 * Configuration QRcode
 */
var html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);

document.getElementById('viewButton').addEventListener('click', view);

autorefresh(refresh);