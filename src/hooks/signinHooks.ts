import { navigate } from '@reach/router'
import { useCallback } from 'react';
import { useDispatch, useStore } from 'store/store';
import { appActions } from 'store/ducks/appDuck';
import { sendMessage } from 'api/message';
import { useEos } from './eosHooks';
import { useKlaytn } from './klaytnHooks';
import { useForm } from 'design/moles/form/Form';

export const useSignin = () => {
  const dispatch = useDispatch()
  const { config: { client, blockchain } } = useStore()
  const { isValidAccount } = blockchain.name.includes('eos') ? useEos() : useKlaytn()

  const setWorking = (working) => {
    dispatch(appActions.setWorking({ working }))
  }

  const signin = useCallback(async ({ values, setErrors }) => {
    const { account, password } = values
    setWorking(true)

    try {
      await isValidAccount({ account, password })
      sendMessage('signin', { data: { account } }, client)
      sessionStorage.setItem('account', account)
      dispatch(appActions.setAccount({ account }))
      await navigate(`/me`)
    } catch (err) {
      const { message: code, field = 'account' } = err
      setErrors({ [field]: code })
    }
    setWorking(false)
  }, [])

  const register = useCallback(async ({ values, setErrors }) => {
    const { account, password } = values

    setWorking(true)
    try {
      await isValidAccount({ account, password })
      await navigate(`/register/keychain?account=${account}`)
    } catch (err) {
      const { message, field = 'account' } = err
      setErrors({ [field]: message })
    }

    setWorking(false)
  }, [])

  return {
    signin,
    register,
  }
}