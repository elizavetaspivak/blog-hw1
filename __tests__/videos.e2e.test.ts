import request from 'supertest'
import {app, VideoType} from "../src/settings";


describe('/videos', () => {
    let newVideo: VideoType | null = null
    let newVideo2: VideoType | null = null

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })

    it('- GET videos = []', async () => {
        await request(app).get('/videos/').expect([])
    })

    it('- POST does not create the video with incorrect data (no title, no author)', async function () {
        await request(app)
            .post('/videos/')
            .send({title: '', author: ''})
            .expect(400, {
                errorsMessages: [
                    {message: 'Invalid title', field: 'title'},
                    {message: 'Invalid author', field: 'author'},
                ],
            })

        const res = await request(app).get('/videos/')
        expect(res.body).toEqual([])
    })

    it('- POST should create the video with correct data (title, author)', async function () {
        const title = 'test title'
        const author = 'test author'

        const response = await request(app)
            .post('/videos/')
            .send({title: 'test title', author: 'test author'})
            .expect(201)

        newVideo = response.body

        expect(response.body).toEqual({...newVideo, title, author})
    })

    it('- POST should create the video with correct data (title, author, availableResolutions)', async function () {
        const title = 'test title'
        const author = 'test author'
        const availableResolutions = ["P240"]

        const response = await request(app)
            .post('/videos/')
            .send({title: 'test title', author: 'test author', availableResolutions: ['P240']})
            .expect(201)

        newVideo2 = response.body

        expect(response.body).toEqual({...newVideo2, title, author, availableResolutions})
    })

    it('- GET video by ID with incorrect id', async () => {
        await request(app).get('/videos/helloWorld').expect(404)
    })

    it('+ GET video by ID with correct id', async () => {
        await request(app)
            .get('/videos/' + newVideo!.id)
            .expect(200, newVideo)
    })


    it('- PUT product by ID with incorrect data', async () => {
        await request(app)
            .put('/videos/' + 1223)
            .send({title: 'title', author: 'title'})
            .expect(404)

        const res = await request(app).get('/videos/')
        expect(res.body[0]).toEqual(newVideo)
    })

    it('+ PUT product by ID with correct data', async () => {
        const data = {
            title: 'hello title',
            author: 'hello author',
            publicationDate: '2023-01-12T08:12:39.261Z',
        }

        await request(app)
            .put('/videos/' + newVideo!.id)
            .send(data)
            .expect(204)

        const res = await request(app).get('/videos/')

        expect(res.body[0]).toEqual({
            ...newVideo,
            ...data
        })
        newVideo = res.body[0]
    })

    it('- DELETE video by incorrect ID', async () => {
        await request(app)
            .delete('/videos/876328')
            .expect(404)

        const res = await request(app).get('/videos/')
        expect(res.body[0]).toEqual(newVideo)
    })

    it('+ DELETE video by correct ID', async () => {
        await request(app)
            .delete('/videos/' + newVideo!.id)
            .expect(204)

        const res = await request(app).get('/videos/')
        expect(res.body.length).toBe(1)
    })
})