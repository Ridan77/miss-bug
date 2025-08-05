import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import cookieParser from 'cookie-parser'
import path from 'path'
import { create } from 'domain'




const app = express()


//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')





//* Read
app.get('/api/bug', (req, res) => {
         const filterBy = {
        txt: req.query.txt,
        minSeverity: +req.query.minSeverity,
        label: req.query.label,
        pageIdx: req.query.pageIdx
    }
    const sortBy = {
        sortField: req.query.sortField,
        sortDir:+req.query.sortDir
    }    
    bugService.query(filterBy,sortBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

//* Create
app.post('/api/bug/', (req, res) => {
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})
//*Edit

app.put('/api/bug/:bugId', (req, res) => {
    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: +req.body.createdAt,
        labels: req.body.labels
    }
    console.log(bugToSave)
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
    // if (visitedBugs.length > 3) {
    //     res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 1000 * 30 })
    //     return res.status(401).send('Wait for a bit') 
    // }
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
app.delete('/api/bug/:bugId/', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug removed! ${bugId} `))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })

})





app.listen(3030, () => console.log('Server ready at port 3030'))