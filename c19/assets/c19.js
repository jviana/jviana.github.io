/* global moment */
class C19 {
    constructor () {
        this.totalPT = 0;
        this.totalDeceasedPT = 0;
        this.totalRecoveredPT = 0;
        this.maxPT = 0;
        this.minPT = 0;
        // Create Set
        this.months = new Set();
        this.flags = {
            monthsRendered: false
        };
    }

    animateNumericVaue (elem, start, end, duration) {
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const obj = $('#' + elem);
        let stepTime;
        let current;
        let timer;
        stepTime = Math.abs(Math.floor(duration / range));
        current = start;
        if (start === end) {
            obj.html(current);
        } else {
            timer = setInterval(function () {
                current += increment;
                obj.html(current);
                if (current === end) {
                    clearInterval(timer);
                }
            }, stepTime);
        }
    }

    getPercentage (total, value) {
        let percentage;
        percentage = value / total * 100;
        percentage = percentage.toFixed(0);
        return percentage;
    }

    displayTotalConfirmed () {
        // STATIC
        // $('#totalConfirmed').html(this.totalPT);
        // $('#totalConfirmedDeceased').html(this.totalDeceasedPT);
        // $('#totalRecovered').html(this.totalRecoveredPT);
        // ANIMATED
        this.animateNumericVaue('totalConfirmed', 0, this.totalPT, 470);
        this.animateNumericVaue('totalRecovered', 0, this.totalRecoveredPT, 400);
    }

    setLayoutTweaks () {
        const barsmax = $('div#main-content-bars').find('div.progress-bar[data-ismax="1"]');
        const barsmin = $('div#main-content-bars').find('div.progress-bar[data-ismin="1"]');
        $.each(barsmax, function (i, bar) {
            $(bar).removeClass('bg-info').addClass('bg-danger');
            $(bar).parent().parent().prev().addClass('text-danger');
        });
        $.each(barsmin, function (i, bar) {
            $(bar).removeClass('bg-info').addClass('bg-success');
            $(bar).parent().parent().prev().addClass('text-success');
        });
        // this.animateNumericVaue('teste', 0, 41, 200);
    }

    setFooter (source, lastDate) {
        const lastSourceContainer = $('#lastsource');
        const lastUpdateContainer = $('#lastupdate');
        lastSourceContainer.html(`<a href="${source.lastURL}">${source.lastDescription}</a>`);
        lastUpdateContainer.html(lastDate.format('DD-MM-YYYY'));
    }

    resetInfo () {
        if (!this.flags.monthsRendered) {
            $('div#main-content-months').find('button').slice(1).remove();
        }
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
        this.flags.monthsRendered = true;
    }

    setBars (globalInfo) {
        const self = this;
        const data = globalInfo.results;
        let barContent;
        this.totalPT = data.reduce((acc, d) => acc + d.ptConfirmed, 0);
        this.maxPT = Math.max.apply(Math, data.map(d => d.ptConfirmed));
        this.minPT = Math.min.apply(Math, data.map(d => d.ptConfirmed));
        let lastDate;
        let lastBarRendered;
        moment.locale('pt');
        $.each(data, function (i, d) {
            const date = moment(d.date, 'YYYYMMDD');
            const day = date.format('D');
            const month = date.format('MMMM');
            const ptConfirmed = d.ptConfirmed;
            const ismax = (ptConfirmed === self.maxPT) ? 1 : 0;
            const ismin = (ptConfirmed === self.minPT) ? 1 : 0;
            self.months.add(month);
            barContent = $('div#day-template').html();
            barContent = barContent.replace(/{{date}}/g, day);
            barContent = barContent.replace(/{{ptConfirmed}}/g, ptConfirmed);
            barContent = barContent.replace(/{{percentage}}/g, self.getPercentage(self.maxPT, ptConfirmed));
            barContent = barContent.replace(/{{ismax}}/g, ismax);
            barContent = barContent.replace(/{{ismin}}/g, ismin);
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
        if (!this.flags.monthsRendered) {
            this.setMonths();
        }
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
