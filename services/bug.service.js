import fs from 'fs'
import { makeId, readJsonFile, getRandomIntInclusive } from "./util.service.js";

const bugs = readJsonFile('data/bugs.json')
const PAGE_SIZE = 6
export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy, sortBy) {
    let bugsToReturn = bugs

    if (filterBy.byUser) {
        bugsToReturn = bugsToReturn.filter(item => item.creator?._id === filterBy.byUser)
        return Promise.resolve(bugsToReturn)
    }

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugsToReturn = bugsToReturn.filter(bug => regExp.test(bug.title))
    }

    if (filterBy.minSeverity) {
        bugsToReturn = bugsToReturn.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.label) {
        bugsToReturn = bugsToReturn.filter(bug => bug.labels.includes(filterBy.label))
    }
    if (sortBy.sortField) {
        if (sortBy.sortField === 'title') {
            bugsToReturn.sort((bug1, bug2) => bug1.title.localeCompare(bug2.title) * sortBy.sortDir)
        } else if (
            sortBy.sortField === 'severity' ||
            sortBy.sortField === 'createdAt') {
            bugsToReturn.sort((bug1, bug2) => (bug1[sortBy.sortField] - bug2[sortBy.sortField]) * sortBy.sortDir)
        }
    }
    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        bugsToReturn = bugsToReturn.slice(startIdx, startIdx + PAGE_SIZE)
    }
    return Promise.resolve(bugsToReturn)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId, loggedinUser) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot find bug - ' + bugId)
    if (loggedinUser._id !== bugs[bugIdx].creator._id) {
        return Promise.reject('Not your bug')
    }
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave, loggedinUser) {

    if (bugToSave._id) {
        console.log('Inside yes id')
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
        if (idx === -1) return Promise.reject('Cannot find bug - ' + bugToSave._id)
        if (bugs[idx].creator._id !== loggedinUser._id) {
            return Promise.reject('Not your bug')
        }
        bugToSave = { ...bugs[idx], ...bugToSave }
        bugs[idx] = bugToSave
    } else {
        bugToSave._id = makeId()
        bugToSave.createdAt = Date.now()
        bugToSave.labels = getLabels(3)
        bugToSave.creator = {
            _id: loggedinUser._id,
            fullName: loggedinUser.fullname,
        }
        bugs.unshift(bugToSave)
    }

    console.log(bugToSave)
    return _saveBugsToFile().then(() => bugToSave)

        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bugs.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}


function getLabels(numOfLabels = 3) {
    const labels = ['critical', 'need-CR', 'dev-branch', 'urgent', 'ASAP']
    var res = []
    for (var i = 0; i < numOfLabels; i++) {
        res.push(labels[getRandomIntInclusive(0, labels.length - 1)])
    }
    return res
}
