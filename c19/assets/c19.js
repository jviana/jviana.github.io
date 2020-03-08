/* global moment */
class C19 {
    constructor () {
        this.totalPT = 0;
        this.totalDeceasedPT = 0;
        this.maxPT = 0;
        // Create Set
        this.months = new Set();
    }

    getPercentage (total, value) {
        let percentage;
        percentage = value / total * 100;
        percentage = percentage.toFixed(0);
        return percentage;
    }

    displayTotalConfirmed () {
        $('#totalConfirmed').html(this.totalPT);
        $('#totalConfirmedDeceased').html(this.totalDeceasedPT);
    }

    setLayoutTweaks () {
        const barsmax = $('div#main-content-bars').find('div.progress-bar[data-ismax="1"]');
        $.each(barsmax, function (i, bar) {
            $(bar).removeClass('bg-info').addClass('bg-danger');
            $(bar).parent().parent().prev().addClass('text-danger');
        });
    }

    setFooter (source, lastDate) {
        const lastSourceContainer = $('#lastsource');
        const lastUpdateContainer = $('#lastupdate');
        lastSourceContainer.html(`<a href="${source.lastURL}">${source.lastDescription}</a>`);
        lastUpdateContainer.html(lastDate.format('DD-MM-YYYY'));
    }

    resetInfo () {
        $('div#main-content-months').find('button').slice(1).remove();
        $('div#main-content-bars').find('div.row-day').slice(1).remove();
    }

    setMonths () {
        const self = this;
        const months = [...this.months];
        let content;
        $.each(months, function (i, m) {
            content = $('div#month-template').html();
            content = content.replace(/{{month}}/g, m);
            $('div#main-content-months').append(`${content}`);
            /* lastBarRendered = $('div#main-content-bars').find('.progress-bar:last')
            lastBarRendered.css('width', '0%');
            lastBarRendered.css('width', self.getPercentage(self.maxPT, ptConfirmed) + '%');
            // adjust text (ptConfirmed)
            if (ptConfirmed === 0) {
                lastBarRendered.addClass('text-dark');
            }
            // adjust text (ptConfirmed) --END
            lastDate = date; */
            $('.btn-month').unbind('click');
            $('.btn-month').click(function (event) {
                event.preventDefault();
                self.resetInfo();
                self.getData();
            });
        });
    }

    setBars (globalInfo) {
        const self = this;
        const data = globalInfo.results;
        let barContent;
        this.totalPT = data.reduce((acc, d) => acc + d.ptConfirmed, 0);
        this.maxPT = Math.max.apply(Math, data.map(d => d.ptConfirmed));
        let lastDate;
        let lastBarRendered;
        moment.locale('pt');
        $.each(data, function (i, d) {
            const date = moment(d.date, 'YYYYMMDD');
            const day = date.format('DD');
            const month = date.format('MMMM');
            const ptConfirmed = d.ptConfirmed;
            const ismax = (ptConfirmed === self.maxPT) ? 1 : 0;
            self.months.add(month);
            barContent = $('div#day-template').html();
            barContent = barContent.replace(/{{date}}/g, day);
            barContent = barContent.replace(/{{ptConfirmed}}/g, ptConfirmed);
            barContent = barContent.replace(/{{percentage}}/g, self.getPercentage(self.maxPT, ptConfirmed));
            barContent = barContent.replace(/{{ismax}}/g, ismax);
            $('div#main-content-bars').append(`${barContent}`);
            lastBarRendered = $('div#main-content-bars').find('.progress-bar:last');
            lastBarRendered.css('width', '0%');
            lastBarRendered.css('width', self.getPercentage(self.maxPT, ptConfirmed) + '%');
            // adjust text (ptConfirmed)
            if (ptConfirmed === 0) {
                lastBarRendered.addClass('text-dark');
            }
            // adjust text (ptConfirmed) --END
            lastDate = date;
        });
        this.displayTotalConfirmed();
        this.setMonths();
        this.setFooter(globalInfo.sources, lastDate);
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
                self.setBars(data);
            })
            .catch(error => console.error(error));
    }
}
const c19 = new C19();
c19.getData();
