import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import cookieParser from 'cookie-parser'



const app = express()


//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())




//* Read
app.get('/api/bug', (req, res) => {
     const filterBy = {
        txt: req.query.txt,
        minSeverity: +req.query.minSeverity,
        pageIdx: req.query.pageIdx
    }
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

//* Create/Edit (before get by id)
app.get('/api/bug/save', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: +req.query.createdAt

    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

//* Get/Read by id
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    let visitedBugs = JSON.parse(req.cookies.visitedBugs || '[]')
    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    if (visitedBugs.length > 3) {
        res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 30 })
        return res.status(401).send('Wait for a bit') 

    }
    console.log(visitedBugs)
    bugService.getById(bugId)
        .then(bug => {
            res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 30 })
            res.send(bug)
            console.log('User visited in the following bugs:', visitedBugs)

        })
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot load bug')
        })
})

//* Remove/Delete
app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send('Bug removed!'))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })

})





app.listen(3030, () => console.log('Server ready at port 3030'))