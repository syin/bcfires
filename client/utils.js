import R from 'ramda'

const filterFiresByYear = (year) => R.filter(x => Number(x.properties.FIRE_YEAR) === Number(year))

export {
    filterFiresByYear
}
