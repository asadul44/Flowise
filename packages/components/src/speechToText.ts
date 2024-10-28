import { ICommonObject, IFileUpload } from './Interface'
import { getCredentialData } from './utils'
import { type ClientOptions, OpenAIClient, toFile } from '@langchain/openai'
import { AssemblyAI } from 'assemblyai'
import { getFileFromStorage } from './storageUtils'
// import axios from 'axios';
// import {VertexAI, VertexAIInput } from '@langchain/google-vertexai'
import { VertexAI } from '@google-cloud/vertexai'
const SpeechToTextType = {
    OPENAI_WHISPER: 'openAIWhisper',
    ASSEMBLYAI_TRANSCRIBE: 'assemblyAiTranscribe',
    LOCALAI_STT: 'localAISTT',
    GOOGLE_VERTEX_API: 'google_VERTEX_APITranscribe'
}

export const convertSpeechToText = async (upload: IFileUpload, speechToTextConfig: ICommonObject, options: ICommonObject) => {
    // console.log(speechToTextConfig,".............................dsdds",upload,options)
    if (speechToTextConfig) {
        const credentialId = speechToTextConfig.credentialId as string
        const credentialData = await getCredentialData(credentialId ?? '', options)
        // console.log(credentialData, credentialId, speechToTextConfig)
        const audio_file = await getFileFromStorage(upload.name, options.chatflowid, options.chatId)

        switch (speechToTextConfig.name) {
            case SpeechToTextType.OPENAI_WHISPER: {
                const openAIClientOptions: ClientOptions = {
                    apiKey: credentialData.openAIApiKey
                }
                const openAIClient = new OpenAIClient(openAIClientOptions)
                const file = await toFile(audio_file, upload.name)
                const openAITranscription = await openAIClient.audio.transcriptions.create({
                    file: file,
                    model: 'whisper-1',
                    language: speechToTextConfig?.language,
                    temperature: speechToTextConfig?.temperature ? parseFloat(speechToTextConfig.temperature) : undefined,
                    prompt: speechToTextConfig?.prompt
                })
                if (openAITranscription?.text) {
                    return openAITranscription.text
                }
                break
            }
            case SpeechToTextType.ASSEMBLYAI_TRANSCRIBE: {
                const assemblyAIClient = new AssemblyAI({
                    apiKey: credentialData.assemblyAIApiKey
                })

                const params = {
                    audio: audio_file,
                    speaker_labels: false
                }

                const assemblyAITranscription = await assemblyAIClient.transcripts.transcribe(params)
                if (assemblyAITranscription?.text) {
                    return assemblyAITranscription.text
                }
                break
            }
            case SpeechToTextType.LOCALAI_STT: {
                const LocalAIClientOptions: ClientOptions = {
                    apiKey: credentialData.localAIApiKey,
                    baseURL: speechToTextConfig?.baseUrl
                }
                const localAIClient = new OpenAIClient(LocalAIClientOptions)
                const file = await toFile(audio_file, upload.name)
                const localAITranscription = await localAIClient.audio.transcriptions.create({
                    file: file,
                    model: speechToTextConfig?.model || 'whisper-1',
                    language: speechToTextConfig?.language,
                    temperature: speechToTextConfig?.temperature ? parseFloat(speechToTextConfig.temperature) : undefined,
                    prompt: speechToTextConfig?.prompt
                })
                if (localAITranscription?.text) {
                    return localAITranscription.text
                }
                break
            }
            case SpeechToTextType.GOOGLE_VERTEX_API: {
                const filePart = {
                    inline_data: {
                        data: Buffer.from(audio_file).toString('base64'),
                        mimeType: 'audio/webm'
                    }
                }

                const textPart = {
                    text: 'Transcribe the audio file as language'
                }
                // Make a POST request to the new API endpoint
                try {
                    const vertexAI = new VertexAI({
                        location: 'me-central2',
                        project: credentialData.projectID
                    })

                    const request = {
                        contents: [
                            {
                                role: 'user',
                                parts: [textPart, filePart]
                            }
                        ]
                    }

                    const streamingResult = await vertexAI
                        .getGenerativeModel({ model: 'gemini-1.5-flash-001' })
                        .generateContentStream(request as any)
                    const contentResponse = await streamingResult.response
                    if (contentResponse && contentResponse.candidates && contentResponse.candidates.length > 0) {
                        // console.log(contentResponse.candidates[0].content.parts[0].text, '=<text')
                        return contentResponse.candidates[0].content.parts[0].text
                    }
                } catch (error) {
                    console.error('Error during transcription:', error)
                    throw error // Handle the error as needed
                }
                break
            }
        }
    } else {
        throw new Error('Speech to text is not selected, but found a recorded audio file. Please fix the chain.')
    }
    return undefined
}
