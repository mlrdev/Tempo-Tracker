import { createContext } from 'preact'
import { useContext, useState, useRef, useEffect } from 'preact/hooks'
import { DB_KEYS } from '../constants/constants'
import { DB } from './data-layer'
import { v4 } from 'uuid'

const DBContext = createContext<Partial<DbHelper>>({})

async function getDb () {
    let defered = []
    for (let key of Object.values(DB_KEYS)) {
        defered.push(DB.get(key).then((data) => ({key, data})))
    }
    const dbEntries = await Promise.all(defered)
    const db = dbEntries.reduce((db, {key, data}) => {
        db[key] = data
        return db
    }, {})

    return db
}

interface CallbackRef{
    ISSUE_CACHE: Record<string, DbListener<'ISSUE_CACHE'>>;
    WORKLOG_CACHE: Record<string, DbListener<'WORKLOG_CACHE'>>;
    tracking: Record<string, DbListener<'tracking'>>;
    updates: Record<string, DbListener<'updates'>>;
    options: Record<string, DbListener<'options'>>;
}

export function DBProvider({ children }) {
    const { Provider } = DBContext
    const [isLoading, setLoading] = useState(true)
    const currentDb = useRef<Partial<DataBase>>({})
    const callbacks = useRef<CallbackRef>(Object.values(DB_KEYS).reduce((callbacks, key) => {
        callbacks[key] = {}
        return callbacks
    }, {} as CallbackRef))
    
    useEffect(() => {
        function checkForUpdates () {
            return getDb().then(db => {
                Object.keys(callbacks).forEach((key) => {
                    if (db[key] !== currentDb.current[key]) {
                        callbacks[key].forEach((cb) => cb(db[key]))
                    }
                })
                currentDb.current = db
            })
        }

        checkForUpdates()
            .then(() => setLoading(false))
        const interval = setInterval(() => checkForUpdates(), 1000)
        return () => clearInterval(interval)
    }, [currentDb])

    const dbHelpers:DbHelper = {
        getDb: () => currentDb.current,
        registerCallback: (key: DB_KEYS, cb:DbListener<DB_KEYS>): string =>  {
            const id = v4()
            callbacks.current[key][id] = cb
            return id           
        },
        unregisterCallback: (key: DB_KEYS, id: string) => {
            delete callbacks.current[key][id]
        },
        updateData: async (key, value) => {
            await DB.set(key, value)
            Object.values(callbacks.current[key as keyof CallbackRef]).forEach(cb => cb(value))
        }
    }

    return (
        <Provider value={dbHelpers}>
            {!isLoading && children}
        </Provider>
    )
}

export function useDatabase<K extends DB_KEYS>(uuid: K) {
    const db = useContext(DBContext)
    const [data, setData] = useState(db.getDb()[uuid])
    useEffect(() => {
        const id = db.registerCallback(uuid, (newData) => {
            setData(newData as DataBase[K])
        })
        return () => db.unregisterCallback(uuid, id)
    }, [db])

    return data
}

export function useDatabaseUpdate<K extends DB_KEYS>(key: K) {
    const db = useContext(DBContext)
    return (value: DataBase[K]) => db.updateData(key, value)
}