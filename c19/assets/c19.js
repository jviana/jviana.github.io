class C19 {
    constructor () {
        console.log('started...');
    }
    setBars (data) {
        let barContent;
        $.each(data, function (i, d) {
            barContent = $('div#day-template').html();
            barContent = barContent.replace(/{{date}}/g, d.date);
            barContent = barContent.replace(/{{ptConfirmed}}/g, d.ptConfirmed);
            $('div#main-content-bars').append(`${barContent}`);
        });
        // 2. new row
    }
    setChart () {
        console.log('chart started...');
    }
    getData () {
        self = this;
        fetch('https://jviana.github.io/c19/data/c19.json')
        .then(response => response.json())
        .then(data => {
            self.setBars(data.results);
        })
        .catch(error => console.error(error))
    }
}
const c19 = new C19();
c19.getData();
