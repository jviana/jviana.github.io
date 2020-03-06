class C19 {
    constructor () {
        console.log('started...');
    }
    setBars (data) {
        let liAreaTemplate;
        $.each(data, function (i, d) {
            liAreaTemplate = $('ul#identificadores-list').find('li.template').html();
            liAreaTemplate = liAreaTemplate.replace(/{{idname}}/g, d.descricao);
            liAreaTemplate = liAreaTemplate.replace(/{{idvalue}}/g, d.valor);
            $('ul#identificadores-list').append(`<li>${liAreaTemplate}</li>`);
        });
        // 2. new row
    }
    setChart () {
        console.log('chart started...');
    }
    getData () {
        fetch('https://jviana.github.io/c19/data/c19.json', {
            mode: 'no-cors', // Useful for including session ID (and, IIRC, authorization headers)
          })
        .then(response => response.json())
        .then(data => {
            console.log(data) // Prints result from `response.json()` in getRequest
        })
        .catch(error => console.error(error))
    }
}
const c19 = new C19();
c19.getData();
