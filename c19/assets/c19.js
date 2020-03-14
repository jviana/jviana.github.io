/* global moment */
class C19 {
    constructor () {
        this.totalPT = 0;
        this.totalDeceasedPT = 0;
        this.totalRecoveredPT = 0;
        this.percentage = {
            totalPT: 0,
            totalDeceasedPT: 0,
            totalRecoveredPT: 0
        }
        this.maxPT = 0;
        this.minPT = 0;
        // Create Set
        this.months = new Set();
        this.flags = {
            monthsRendered: false
        };
        this.dataURL = 'https://jviana.github.io/c19/data/c19.json?v=' + Math.floor(Math.random() * (1000 - 1 + 1) + 1);
    }

    animateNumericValue2 (elem, start, end, duration, decimalDigits, aditionalCharacter = '') {
        const obj = $('#' + elem);
        const step = ts => {
            if (!start) {
                start = ts;
            }
            let progress = (ts - start) / duration;
            let intermediateValue;
            if (decimalDigits === 0) {
                intermediateValue = Math.floor(progress * end);
                if (intermediateValue <= end) {
                    obj.html(intermediateValue + aditionalCharacter);
                } else {
                    obj.html(end);
                }
            } else {
                intermediateValue = progress * end;
                if (intermediateValue <= end) {
                    obj.html(intermediateValue.toFixed(2) + aditionalCharacter);
                } else {
                    obj.html(end.toFixed(2) + aditionalCharacter);
                }
            }
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    animateNumericValue (elem, start, end, duration, decimalDigits) {
        const range = end - start;
        const obj = $('#' + elem);
        let increment;
        let stepTime;
        if (decimalDigits === 0) {
            increment = end > start ? 1 : -1;
            stepTime = Math.abs(Math.floor(duration / range));
        } else {
            increment = 1 / Math.pow(10, decimalDigits);
            end = end.toFixed(2);
            stepTime = 0;
        }
        
        let current;
        let timer;
        current = start;
        obj.html(current);
        if (start === end) {
            obj.html(current);
        } else {
            timer = setInterval(function () {
                if (decimalDigits > 0) {
                    current = current + increment;
                    /* console.log(current);
                    current = current.toFixed(2); */
                    obj.html(current.toFixed(2) + '%');
                    if (current.toFixed(2) === end) {
                        clearInterval(timer);
                    }
                } else {
                    current += increment;
                    obj.html(current);
                    if (current === end) {
                        clearInterval(timer);
                    }
                }
            }, stepTime);
        }
    }

    getPercentage (total, value, decimalDigits = 0) {
        let percentage;
        percentage = value / total * 100;
        // percentage = percentage.toFixed(decimalDigits);
        return percentage;
    }

    displayTotalConfirmed () {
        // STATIC
        // $('#totalConfirmed').html(this.totalPT);
        // $('#totalConfirmedDeceased').html(this.totalDeceasedPT);
        // $('#totalRecovered').html(this.totalRecoveredPT);
        // ANIMATED
        const duration = 500;
        this.animateNumericValue2('totalConfirmed', 0, this.totalPT, duration, 0);
        this.animateNumericValue2('totalRecovered', 0, this.totalRecoveredPT, duration, 0);
        this.animateNumericValue2('totalDeceased', 0, this.totalDeceasedPT, duration, 0);
        // percentage
        this.animateNumericValue2('totalRecoveredPercentage', 0, this.percentage.totalRecoveredPT, duration, 2, '%');
    }

    setLayoutTweaks () {
        const todayDateNumeric =  moment().format('YYYYMMDD');
        const barsmax = $('div#main-content-bars').find('div.progress-bar[data-ismax="1"]');
        const barsmin = $('div#main-content-bars').find('div.progress-bar[data-ismin="1"]');
        const currentDayBar = $('div#main-content-bars').find('div.row-day[data-date="' + todayDateNumeric + '"]').find('div.progress-bar');
        $.each(barsmax, function (i, bar) {
            $(bar).removeClass('bg-info').addClass('bg-danger');
            $(bar).parent().parent().prev().addClass('text-danger');
        });
        $.each(barsmin, function (i, bar) {
            $(bar).removeClass('bg-info').addClass('bg-success');
            $(bar).parent().parent().prev().addClass('text-success');
        });
        // present day (animation)
        currentDayBar.addClass('progress-bar-striped progress-bar-animated');
    }

    setFooter (source, lastDate) {
        const lastSourceContainer = $('#lastsource');
        const lastUpdateContainer = $('#lastupdate');
        lastSourceContainer.html(`<a href="${source.lastURL}" class="text-info" target="_blank">${source.lastDescription}</a>`);
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
        // Total =======
        this.totalPT = data.reduce((acc, d) => acc + d.ptConfirmed, 0);
        this.totalRecoveredPT = data.reduce((acc, d) => acc + d.ptRecovered, 0);
        this.totalDeceasedPT = data.reduce((acc, d) => acc + d.ptDeceased, 0);
        // Percentage ==
        this.percentage.totalRecoveredPT = this.getPercentage(this.totalPT, this.totalRecoveredPT, 2);
        this.percentage.totalDeceasedPT = this.getPercentage(this.totalPT, this.totalDeceasedPT, 2);
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
            // dates
            const dateNumeric = {
               full: date.format('YYYYMMDD'),
               month: date.format('MM')
            }
            self.months.add(month);
            barContent = $('div#day-template').html();
            barContent = barContent.replace(/{{date}}/g, day);
            barContent = barContent.replace(/{{ptConfirmed}}/g, ptConfirmed);
            barContent = barContent.replace(/{{percentage}}/g, self.getPercentage(self.maxPT, ptConfirmed));
            barContent = barContent.replace(/{{ismax}}/g, ismax);
            barContent = barContent.replace(/{{ismin}}/g, ismin);
            barContent = barContent.replace(/{{datenum}}/g, dateNumeric.full);
            barContent = barContent.replace(/{{monthnum}}/g, dateNumeric.month);
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

    getData () {
        const self = this;
        fetch(this.dataURL)
            .then(response => response.json())
            .then(data => {
                self.setBars(data);
            })
            .catch(error => console.error(error));
    }
}
const c19 = new C19();
c19.getData();
