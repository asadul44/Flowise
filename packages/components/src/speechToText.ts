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
                        apiEndpoint: 'me-central2-aiplatform.googleapis.com',
                        project: credentialData.projectID,
                        googleAuthOptions: {
                            credentials: {
                                client_email: 'service-account@test-first-project-432511.iam.gserviceaccount.com',
                                private_key:
                                    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMfVdUC/MFNsV2\n7pnv7Bt6YonYKLNwWvlRrXB0BxEqeWlV/6P/odWBGu5GUDPPiRIqzX3vaxF7I/Ea\nNCf6uxjzb3u5GezrOTzWucRq6kR+pZXEnYbDZH0/C0XoNds7VTU8Y/rpHE/bi9lC\nBIb1SvPGxXy0yrV87iqpljGUC8ncijQnFA4o6+KG8N0EA432eOiG7XtyGAT0Ow16\nR7YKTBMVTmc2LumfijcwvYbU4/rNJYemyXMuUj/46wtm9SxkDOdPamEox6dGoxg5\nJpxHIz8LiAPsiwiDR3QspZE5/Oxh8Z/4aeAVdJdW1YafnKZ8BA5SETW/QSK3d795\n1rwQI5LjAgMBAAECggEACJ3Rc7OrMlGMAYZtSxxGTiJfz5FrejUDI2ts/R6dHQ6P\nnzWN6gQeNHn3h1Py0vBiKRaOk2uOCYPKsYF4G8sNcpiEfJi4kHLRevTJ731elH2S\nsX23w3z1ABaQBAhc7AOboidOV8s/HC+o4GzDaQuW+Q2yQwX1nsWEW6/999CFWXsP\n+84ojEL+DRIhw41m4dN6YHiLqB12V8WhLLIjQvatln7xT3gVRrHZV+2dcy3PZSJc\nuNUPW45/H6lGPxNxaQ4IkJUYx+WqTuRSeQ5EwzmVlTRk8F/cDrLjuwiBlYAKVQJW\nvA3awJl5ZTWmBBoGKLc/J9NZjfu+iNRhf9iTiJ8zIQKBgQD5gOEjixXP8LIl/PyK\nIYwMcjxN3McN3JEdnhnWYh1DaElZyMstGNaKgl1CVB12NXXw7sKv19zl2hm1iyMT\nJ6SIuYDMBfZZXwRUKt1mSdLLV7MWoL2ikgBNsw080mzdbpVrsGsNiad4z0leTvPE\n6S2nb//a89cm4pNtfL35lG6JwwKBgQDR0Gl8Zll/LtFLSglWr/MZLU/fylTc1fCU\n7zNkuRtWunV5HDze/Gxh2AzMtAQootUxeAj4ZkcfbLKov86H4KL+QZV3kHG1T1fQ\nZYsvo9LPf4ya54QfY9FUvbXAitMlDkZNvPqHmYvzCN1MWnuGbI9PeAPI5Shk/yBE\nzcPDEUMgYQKBgQDvJ+UmL7R5vErW9PeQ4/UdHQbGz6ARnmGPFTPI9gT8zuK4aCqw\nkIVdAPaplH0lCLuDdSkyamR4AiXwiWzWeIJS+BUH+5MWOWip0Oilmo+uj+K/Btaf\nFPmrgLxol374hX4+Wj1THaZku7Sk7GLnVWeIfmeuFVsfD8GnChIDQI7wBwKBgFB6\ncpvG3nlMSfdpFJ/tqX90w/iBMX/rh/Z4sevmnLftmXW1ARw/EouNRYuXWSkFHGV3\nN2mgQZOqK/VSbTPtVFfWbDCKdTMolfRXnsXNPuVcdWBNgX5Q2VB53CdYmJjUGt9i\np24v1WCJe+j3o/3x0h6XWExMqevjeEsr6fT+wBLBAoGARHV54y8ucJckJMukOXuG\nasJhc6kx3o1Cc8lBztF/nUX40T0+XqWZ/UJq6c22u3N9I7RVtS+eJkxEcDzI1bLz\nSdHC96+NW//P+TgX1v3yf7ymcAublt3sQKL4oRP+2KAnd1GjbI9utE6M0db9dew+\nN8J2WDQZ4FQof5inD+7nkrY=\n-----END PRIVATE KEY-----\n'
                            },
                            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                            projectId: 'test-first-project-432511'
                        }
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
