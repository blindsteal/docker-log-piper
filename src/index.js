const client = require('axios').create({
    socketPath: '/var/run/docker.sock'
})
const util = require('util')
const fs = require('fs')
const { Transform } = require('stream')

const config = {
    log_dir: './logs'
}

const state = {
    streams: {}
}

class DockerLogTransform extends Transform {
    _transform(chunk, encoding, callback) {
        callback(null, chunk.slice(8))
    }
}

const pipeLog = async (container) => {
    const id = container.Id
    const name = container.Names[0].replace('/', '')
    const log_filename = `${config.log_dir}/${name}.log`
    const log_out_stream = fs.createWriteStream(log_filename, {
        flags: 'a',
        encoding: 'utf8'
    })

    const log_res = await client.get(`/containers/${id}/logs`, {
        params: {
            stdout: true,
            stderr: true,
            follow: true
        },
        responseEncoding: 'utf8',
        responseType: 'stream'
    })
    const log_in_stream = log_res.data
    
    console.log(`streaming logs for ${name} (${id}) to ${log_filename}`)

    log_in_stream.pipe(new DockerLogTransform()).pipe(log_out_stream)

    state.streams[id] = { log_in_stream, log_out_stream }
}

const handleDockerEvent = data => {
    const event = JSON.parse(data.toString())
    const { Action, Actor: { ID }, Type } = event

    if(Action === 'stop' && Type === 'container' && state.streams[ID]){
        const { log_in_stream, log_out_stream } = state.streams[ID]

        console.log(`received stop event for ${ID}, closing streams`)

        log_in_stream.destroy()
        log_out_stream.destroy()
        delete state.streams[ID]
    }
    else if(Action === 'start' && Type === 'container'){
        console.log(`received start event for ${ID}`)

        pipeLog({ Id: ID, Names: [event.Actor.Attributes.name] })
    }
}

const main = async () => {
    try {
        const ps_res = await client.get('/containers/json')
        console.log(`${ps_res.data.length} containers running`)

        ps_res.data.forEach(pipeLog)

        const event_res = await client.get(`/events`, {
            responseEncoding: 'utf8',
            responseType: 'stream'
        })
        const event_stream = event_res.data
        event_stream.on('data', handleDockerEvent )
    }
    catch(err) {
        console.log(util.inspect(err))
    }
}

main()