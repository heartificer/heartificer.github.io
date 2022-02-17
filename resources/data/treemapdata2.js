const getRandomStat = (size = 3) => {
    let num = Math.floor(Math.random() * Date.now() );
    let ens = num.toString().split('');
    let val = ens.slice(ens.length - size, ens.length).join('')*1;
    return val;
}

const mockStats = () => {
    return [
        { name: "Coal", value: getRandomStat() },
        { name: "Solar", value: getRandomStat() },
        { name: "Wind", value: getRandomStat() },
        { name: "Wave", value: getRandomStat() },
        { name: "Geothermal", value: getRandomStat() },
    ];
};

const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia'];

let treemapdata = {
    name: "United States",
    children: states.map( state => {
        return {
            name: state,
            children: mockStats()
        }
    })
  }; 