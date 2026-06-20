const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const getToken = () => localStorage.getItem('bb_token')

const getHeaders = (includeAuth = true) => {
    const headers = {
        'Content-Type': 'application/json'
    }

    if (includeAuth && getToken()) {
        headers.Authorization = `Bearer ${getToken()}`
    }

    return headers
}

const buildUrl = (endpoint, params = {}) => {
    const url = new URL(`${API_BASE}${endpoint}`)

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return
        }

        url.searchParams.set(key, value)
    })

    return url.toString()
}

const request = async (endpoint, options = {}) => {
    const { method = 'GET', body, params, includeAuth = true } = options
    const response = await fetch(buildUrl(endpoint, params), {
        method,
        headers: getHeaders(includeAuth),
        body: body ? JSON.stringify(body) : undefined
    })

    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json() : await response.text()

    if (!response.ok) {
        const message = data?.message || data || 'Request failed'
        throw new Error(message)
    }

    return data
}

const api = {
    get: (endpoint, params = {}, options = {}) => request(endpoint, { ...options, method: 'GET', params }),
    post: (endpoint, body = {}, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body = {}, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
}

export default api
