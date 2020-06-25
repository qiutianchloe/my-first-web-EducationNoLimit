const sinon = require("sinon")
const expect = require("chai").expect

const user = require("../../database/model/userModel")
const controllers = require("../../controllers/usercontroller")

describe('controller test', ()=>{
    const sandbox = sinon.createSandbox()

    after(async ()=>{
        sandbox.restore()
    })

    it('loginController', async ()=>{
        const fake = sinon.fake()
        const request = {
            body:{email:'abc@gmail.com',password:'abc123'}
        }
        const response = {
            render: fake
        }

        sandbox.replace(user, 'findOne', (obj)=>{
            return Promise.resolve({...obj,errMsg:'error'})
        })

        await controllers.loginController(request,response)

        const result = fake.lastCall.lastArg

        expect(result).to.have.property('errMsg')
        expect(result.errMsg.networkErr).to.equal('Something goes wrong, please try again later.')

    })
})