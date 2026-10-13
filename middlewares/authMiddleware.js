import Jwt from 'jsonwebtoken'

const generateAuth = async (generateObject) => {
    let authObject = {
      status: false,
      data: {},
      message: '',        
    }
    try {
        const { authToken = '' } = generateObject
        const cipherKey = 'abs-auth-key'
        if (cipherKey != '') { 
            const authInfo = await new Promise((resolve, reject) => {
                Jwt.verify(authToken, cipherKey, function (err, decoded) {
                if (err) { reject(new Error(err.message || 'Failed to authenticate.')) }
                    else {
                        resolve(decoded)
                    }
                })
            })
            authObject = {
                status: true,
                data: {
                    userId: authInfo.userId,
                    email: authInfo.email,
                    name: authInfo.name,
                    role: authInfo.role,
                },
                message: 'Auth Verified',
            }
        }
    } catch (error) {
      console.log("ERROR", error)
      authObject = {
        status: true,
        data: {},
        message: error.message || 'Authentication Error',
      }   
    }
    return authObject
}

const authorize = (roles = []) => async (req, res, next) => {
    try {
        const Authorization = req.headers['authorization'] || null
        if(!Authorization) return res.status(401).json({ message: 'Authentication is required.' }) 
        const generateObject = {
            authToken: Authorization
        }

        const generateAuthFunc = await generateAuth(generateObject)
        if(!generateAuthFunc.status) return res.status(401).json({ message: 'Authentication token is invalid.' })

        const authData = generateAuthFunc.data
        
        if(!roles.includes(authData.role)) return res.status(401).json({ message: 'Authentication role not permit for this action.' })

        req.auth = authData
        next()
    } catch (error) {
        return res.status(401).json({ 'success': false, message: error.message || 'Authentication Failed' }); 
    }
}

export { authorize }