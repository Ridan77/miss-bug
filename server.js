import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { authService } from './services/auth.service.js'
import { userService } from './services/user.service.js'


///Server Ex

const app = express()


//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')



//Express Routing

//* Read
app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt,
        minSeverity: +req.query.minSeverity,
        label: req.query.label,
        pageIdx: req.query.pageIdx,
        byUser: req.query.byUser
    }
    const sortBy = {
        sortField: req.query.sortField,
        sortDir: +req.query.sortDir
    }
    bugService.query(filterBy, sortBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

//* Create


app.post('/api/bug/', (req, res) => {

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not authenticated')

    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
    }
    bugService.save(bugToSave,loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})
//*Edit

app.put('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not authenticated')
    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: +req.body.createdAt,
        labels: req.body.labels,
        creator: {
            _id: req.body.creator._id,
            fullname: req.body.creator.fullname
        }
    }
    bugService.save(bugToSave, loggedinUser)
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


//User API

app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})
// Auth API

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})


app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService.add(credentials)
        .then(user => {
            if (user) {
                const logintoken = authService.getLoginToken(user)
                res.cookie('loginToken', logintoken)
                res.send(user)
            } else {
                res.status(400).send('Cannot Signup')
            }
        })
        .catch(err => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
