import express, {Request, Response} from "express";

export const app = express()

app.use(express.json())

type RequestWithParams = Request<{ id: number }, {}, {}, {}>

type RequestWithBody = Request<{}, {}, {
    title: string,
    author: string,
    availableResolutions: typeof AvailableResolutions
}, {}>

type RequestWithParamsAndBody = Request<{ id: number }, {}, {
    title: string,
    author: string,
    availableResolutions: typeof AvailableResolutions,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    publicationDate: string
}, {}>

type ErrorMessageType = {
    message: string
    field: string
}

type ErrorType = {
    errorsMessages: ErrorMessageType[]
}

const AvailableResolutions = [ "P144" , "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"]

export type VideoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: typeof AvailableResolutions
}

const videos: VideoType[] = [
    {
        id: 1,
        title: "test",
        author: "string",
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: "2023-07-17T15:49:14.428Z",
        publicationDate: "2023-07-17T15:49:14.428Z",
        availableResolutions: [
            "P144"
        ]
    }
]

app.get('/videos', (req: Request, res: Response) => {
    res.send(videos);
})

app.get('/videos/:id', (req: RequestWithParams, res: Response) => {
    const id = +req.params.id

    const video = videos.find((video) => video.id === id)

    if (!video) {
        res.sendStatus(404)
        return
    }

    res.send(video)
})

app.post('/videos', (req: RequestWithBody, res: Response) => {
    let errors: ErrorType = {
        errorsMessages: []
    }

    let {title, author, availableResolutions} = req.body

    if (!title || !title.length || title.trim().length > 40) {
        errors.errorsMessages.push({message: 'Invalid title', field: 'title'})
    }

    if (!author || !author.length || author.trim().length > 20) {
        errors.errorsMessages.push({message: 'Invalid author', field: 'author'})
    }

    if (Array.isArray(availableResolutions)) {
        availableResolutions.map((r) => {
            !AvailableResolutions.includes(r) && errors.errorsMessages.push({
                message: 'Invalid availableResolutions',
                field: 'availableResolutions'
            })
        })
    } else {
        availableResolutions = [];
    }

    if (errors.errorsMessages.length){
        res.status(400).send(errors)
        return
    }

    const createdAt = new Date()
    const publicationDate = new Date()

    publicationDate.setDate(createdAt.getDate() + 1)

    const newVideo: VideoType = {
        id: +(new Date()),
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate: publicationDate.toISOString(),
        title,
        author,
        availableResolutions
    }

    videos.push(newVideo)

    res.status(201).send(newVideo)
})

app.put('/videos/:id', (req: RequestWithParamsAndBody, res) => {
    const id = req.params.id

    let errors: ErrorType = {
        errorsMessages: []
    }

    const title = req.body.title
    const author = req.body.author
    let availableResolutions = req.body.availableResolutions
    let canBeDownloaded = req.body.canBeDownloaded
    let minAgeRestriction = req.body.minAgeRestriction
    let publicationDate = req.body.publicationDate

    if (!title || !title.length || title.trim().length > 40) {
        errors.errorsMessages.push({message: 'Incorrect title', field: 'title'})
    }

    if (!author || !author.length || author.trim().length > 20) {
        errors.errorsMessages.push({message: 'Incorrect author', field: 'author'})
    }

    if (Array.isArray(availableResolutions)) {
        availableResolutions.map((a: string) => {
            !AvailableResolutions.includes(a) && errors.errorsMessages.push({
                message: 'Incorrect availableResolutions',
                field: 'availableResolutions'
            })
        })
    }else {
        availableResolutions = []
    }

    if (typeof canBeDownloaded === "undefined") {
        canBeDownloaded = false
    }

    if (typeof minAgeRestriction !== "undefined" && minAgeRestriction) {
        minAgeRestriction < 1 || minAgeRestriction > 18 && errors.errorsMessages.push({
            message: 'Incorrect minAgeRestriction',
            field: 'minAgeRestriction'
        })
    } else {
        minAgeRestriction = null
    }

    if (errors.errorsMessages.length) {
        res.status(400).send(errors)
        return
    }

    let createdAt = new Date()

    if (!publicationDate) {
        publicationDate = new Date(createdAt.getDate() + 1).toISOString()
    }

    let videoIndex = videos.findIndex(v => v.id === +id)
    const video = videos.find(v => v.id === +id)


    if (!video) {
        res.sendStatus(404)
        return;
    }

    let newItem = {
        ...video,
        canBeDownloaded,
        minAgeRestriction,
        publicationDate,
        title,
        author,
        availableResolutions
    }

    videos.splice(videoIndex, 1, newItem)

    res.sendStatus(204)
})

app.delete('/videos/:id', (req: RequestWithParams, res) => {
    const id = +req.params.id

    const video = videos.find((v) => v.id === id)

    if (!video) {
        res.sendStatus(404)
        return;
    }

    let videoIndex = videos.findIndex(v => v.id === +id)

    videos.splice(videoIndex, 1)

    res.sendStatus(204)
})

app.delete('/testing/all-data', (req: Request, res: Response) => {
    videos.length = 0
    res.sendStatus(204)
})