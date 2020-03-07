/* global moment */
class C19 {
    constructor () {
        this.totalPT = 0;
        this.maxPT = 0;
    }

    getPercentage (total, value) {
        let percentage;
        percentage = value / total * 100;
        percentage = percentage.toFixed(0);
        return percentage;
    }

    displayTotalConfirmed () {
        $('#totalConfirmed').html(this.totalPT);
    }

    setLayoutTweaks () {
        const barsmax = $('div#main-content-bars').find('div.progress-bar[data-ismax="1"]');
        $.each(barsmax, function (i, bar) {
            $(bar).removeClass('bg-info').addClass('bg-danger');
            $(bar).parent().parent().prev().addClass('text-danger');
        });
    }

    setBars (data) {
        const self = this;
        let barContent;
        this.totalPT = data.reduce((acc, d) => acc + d.ptConfirmed, 0);
        this.maxPT = Math.max.apply(Math, data.map(d => d.ptConfirmed));
        $.each(data, function (i, d) {
            const date = moment(d.date, 'YYYYMMDD');
            const day = date.format('DD');
            const ptConfirmed = d.ptConfirmed;
            const ismax = (ptConfirmed === self.maxPT) ? 1 : 0;
            barContent = $('div#day-template').html();
            barContent = barContent.replace(/{{date}}/g, day);
            barContent = barContent.replace(/{{ptConfirmed}}/g, ptConfirmed);
            barContent = barContent.replace(/{{percentage}}/g, self.getPercentage(self.maxPT, ptConfirmed));
            barContent = barContent.replace(/{{ismax}}/g, ismax);
            $('div#main-content-bars').append(`${barContent}`);
            $('div#main-content-bars').find('.progress-bar:last').css('width', '0%');
            $('div#main-content-bars').find('.progress-bar:last').css('width', self.getPercentage(self.maxPT, ptConfirmed) + '%');
        });
        this.displayTotalConfirmed();
        setTimeout(() => self.setLayoutTweaks(), 1000);
    }

    setChart () {
        console.log('chart started...');
    }

    getData () {
        const self = this;
        fetch('https://jviana.github.io/c19/data/c19.json')
            .then(response => response.json())
            .then(data => {
                self.setBars(data.results);
            })
            .catch(error => console.error(error));
    }
}
const c19 = new C19();
c19.getData();
