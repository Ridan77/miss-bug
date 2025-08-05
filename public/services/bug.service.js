import { utilService } from './util.service.js'

const BASE_URL = '/api/bug/'

// _createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy,) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
        .then(bugs => {
            return bugs
        })
}

function getById(bugId) {
    console.log(BASE_URL + bugId)
    return axios(BASE_URL + bugId)
        .then(res => res.data)
        .catch(err => {
            if (err.response && err.response.status === 401) {
                console.log(err.response.data)
                throw err.response.data
            }
        })
}

function remove(bugId) {
    return axios(BASE_URL + bugId + '/remove')
        .then(res => res.data)
        .catch(err => console.log('err:', err))


}

function save(bug) {
    let queryParams = `?title=${bug.title}&severity=${bug.severity}&description=${bug.description}&createdAt=${bug.createdAt}`
    if (bug._id) queryParams += `&_id=${bug._id}`
    return axios(BASE_URL + 'save' + queryParams)
        .then(res => res.data)
        .catch(err => console.log('err:', err))
}







function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}