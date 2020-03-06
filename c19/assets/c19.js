class C19 {
    constructor () {
        console.log('started...');
    }

    setBars (data) {
        let barContent;
        let total;
        total = 0;
        $.each(data, function (i, d) {
            let date;
            let day;
            date = moment(d.date, 'YYYYMMDD');
            day = date.format('DD');
            barContent = $('div#day-template').html();
            barContent = barContent.replace(/{{date}}/g, day);
            barContent = barContent.replace(/{{ptConfirmed}}/g, d.ptConfirmed);
            total += d.ptConfirmed;
            $('div#main-content-bars').append(`${barContent}`);
        });
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
