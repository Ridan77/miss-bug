import { utilService } from './util.service.js'

const BASE_URL = '/api/bug/'

// _createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getDefaultSort
}

function query(filterBy,sortBy) {
    return axios.get(BASE_URL, { params: { ...filterBy, ...sortBy } })
        .then(res => res.data)
        .then(bugs => {
            return bugs
        })
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
        .catch(err => {
            if (err.response && err.response.status === 401) {
                console.log(err.response.data)
                throw err.response.data
            }
        })
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId + '/remove')
        .then(res => res.data)
        .catch(err => console.log('err:', err))


}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL + bug._id, bug)
            .then(res => res.data)
            .catch(err => console.log('err:', err))
    } else {
        return axios.post(BASE_URL, bug)
            .then(res => res.data)
            .catch(err => console.log('err:', err))
    }
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0,pageIdx:0 }
}

function getDefaultSort(){
    return {sortField:'',sortDir:1}
}