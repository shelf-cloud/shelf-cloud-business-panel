import { NextApiHandler } from 'next'
import axios from 'axios'

const resetPassword: NextApiHandler = async (request, response) => {

    axios.post(`${process.env.API_DOMAIN_SERVICES}/resetPassword.php`, {
        newPassword: request.body.resetPasswordInfo.newPassword,
        confirmPassword: request.body.resetPasswordInfo.confirmPassword,
        resetToken: request.body.resetPasswordInfo.resetToken,
    })
        .then(({ data }) => response.json(data))
        .catch((error) => {
            response.end(error)
        });
}

export default resetPassword