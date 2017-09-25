import R from 'ramda'

const filterFiresByYear = (year) => R.filter(x => Number(x.properties.FIRE_YEAR) === year)


export {
    filterFiresByYear
}