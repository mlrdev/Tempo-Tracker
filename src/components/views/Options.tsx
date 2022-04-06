import { HelpCircle } from "preact-feather"
import { useEffect, useRef, useState } from "preact/hooks"
import styled from "styled-components"
import { CACHE } from "../../constants/constants"
import { useCache } from "../../hooks/useCache"
import { useOptions } from "../../hooks/useOptions"
import { useSafeState } from "../../hooks/useSafeState"
import { headers } from "../../utils/jira"
import { DualRangeSlider } from "../atoms/DualRangeSlider"
import { Input } from "../atoms/Input"
import { FlexColumn, FlexRow } from "../atoms/Layout"
import { Tooltip } from "../atoms/Tooltip"
import { H6, Label } from "../atoms/Typography"

const Body = styled.div`
    display: flex;
    flex-direction: column;
    overflow: auto;
`
const Option = styled.div`
    display: flex;
    flex-direction: column;
    margin: 8px 18px;
    position: relative;
`
const HelpTooltip = styled(Tooltip)`
    position: absolute;
    top: 18px;
    left: -18px;

    &:before {
        min-width: 150px;
    }
`
const TimeRange = styled.time`
    width: 210px;
    text-align: center;
`
const Mandatory = styled.span`
    color: red;
    font-size: 14px;
    display: inline-block;
    margin-top: -3px;
    margin-left: 1px;
`
const SectionHead = styled(H6)`
    font-size: 1rem;
    padding: 16px 0 4px 8px;
    margin: 0;
    background: white;
    top: 0;
    position: sticky;
    z-index: 1;
`

export const OptionsView: React.FC = () => {
    const { data: options, actions } = useOptions()
    const [isTokenFocused, setTokenFocused] = useState(false)
    const [token, setToken] = useState('')
    const [valid, setValid] = useSafeState(true)
    const { user, domain, token: storedToken } = options
    const current = useRef(`${user}${domain}${storedToken}`)
    
    const checkDomainToken = (token?: string) => {
        const testToken = token || storedToken
        if (user.length && domain.length && testToken.length) {
            const id = `${user}${domain}${testToken}`
            current.current = id
            fetch(`${domain}/api/2/user?username=${user}`, { headers: headers(testToken), credentials: 'omit' })
                .then(async (r) => {
                    if (current.current !== id) return 
                    if (r.status === 200) {
                        const res = await r.json()
                        if (res?.name === user) {
                            setValid(true)
                            return 
                        }
                    }
                    setValid(false)
                })
                .catch(() => {
                    if (current.current !== id) return
                    setValid(false)
                })
        }
        else {
            setValid(false)
        }
    }

    useEffect(() => {
        checkDomainToken()
    }, [])

    const cache = useCache(CACHE.ISSUE_CACHE, [])

    const updateOverlayDay = (day) => (e) => {
        if (e.target.checked) {
            actions.merge({ overlayDays: [day].concat(options.overlayDays) })
        }
        else {
            actions.merge({ overlayDays: options.overlayDays.filter(v => v !== day) })
        }
    }

    const overlayHoursStart = `${Math.floor(options.overlayHours[0] / 60)}:${`00${options.overlayHours[0] % 60}`.slice(-2)}`
    const overlayHoursEnd = `${Math.floor(options.overlayHours[1] / 60)}:${`00${options.overlayHours[1] % 60}`.slice(-2)}`
    const stars = options.token.length ? Array(Math.max(options.token.length - 8, 12)).fill('*').join('') : ''
    const tokenObfuscated = `${options.token.slice(0, 4)}${stars}${options.token.slice(-4)}`

    const tokenBlur = async () => {
        if (token?.length && token !== options.token) {
            await actions.merge({ token })            
        }
        setTokenFocused(false)
        checkDomainToken(token)
    }
    const showError = Boolean(!valid && user.length && domain.length && storedToken.length)

    return (
        <Body>
            <SectionHead>Jira Options</SectionHead>
            <Option>
                <Label>Username<Mandatory>*</Mandatory></Label>
                <Input error={showError} onBlur={() => checkDomainToken()} value={options.user} onChange={(e) => actions.merge({ user: e.target.value })} />
            </Option>
            <Option>
                <Label>Personal Access Token<Mandatory>*</Mandatory></Label>
                <HelpTooltip content="A Personal Access Token can be created via your JIRA Profile.">
                    <HelpCircle size={14} />
                </HelpTooltip>
                <Input
                    error={showError}
                    value={isTokenFocused ? token : tokenObfuscated}
                    onFocus={() => setTokenFocused(true)}
                    onBlur={tokenBlur}
                    onChange={(e) => setToken(e.target.value)} />
            </Option>
            <Option>
                <Label>Server URL<Mandatory>*</Mandatory></Label>
                <HelpTooltip content="URL of your JIRA server's REST API: https://jira.domain.com/rest.">
                    <HelpCircle size={14} />
                </HelpTooltip>
                <Input error={showError} onBlur={() => checkDomainToken()} value={options.domain} onChange={(e) => actions.merge({ domain: e.target.value })} />
            </Option>
            <Option>
                <Label>Tracked Issues<Mandatory>*</Mandatory></Label>
                <HelpTooltip content="Comma separated list of issues you want to track time for.">
                    <HelpCircle size={14} />
                </HelpTooltip>
                <Input disabled={!valid} value={valid ? Object.keys(options.issues).join(', ') : ''} onBlur={(e) => {
                    if (valid) {
                        actions.merge({ issues: e.target.value.split(',').reduce((obj, v) => ({ ...obj, [v.trim()]: '' }), {}) })
                        cache.resetCache();
                    }
                }} />
            </Option>
            {!isFirefox && (
                <>
                    <SectionHead>App Options</SectionHead>
                    <Option>
                        <Label>Automatic Synchronization</Label>
                        <FlexRow justify="flex-start">
                            <Input style={{ margin: '0 6px' }} type="checkbox" checked={options.autosync} onChange={(e) => actions.merge({ autosync: e.target.checked })} />
                            <Label>enabled</Label>
                        </FlexRow>
                    </Option>
                </>
            )}
            <SectionHead>Browser Overlay</SectionHead>
            <Option>
                <Label>Activate Browser Overlay</Label>
                <FlexRow justify="flex-start">
                    <Input style={{ margin: '0 6px' }} type="checkbox" checked={options.overlay} onChange={(e) => actions.merge({ overlay: e.target.checked })} />
                    <Label>enabled</Label>
                </FlexRow>
            </Option>
            <Option>
                <Label>Active Days</Label>
                <FlexRow justify="flex-start">
                    {['Sun', 'Mo', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx: (0 | 1 | 2 | 3 | 4 | 5 | 6)) => (
                        <FlexColumn key={day} style={{ width: 25 }}>
                            <Input type="checkbox" checked={options.overlayDays.includes(idx)} onChange={updateOverlayDay(idx)} />
                            <Label>{day}</Label>
                        </FlexColumn>
                    ))}
                </FlexRow>
            </Option>
            <Option>
                <Label>Active Hours</Label>
                <FlexColumn style={{ margin: '0 6px' }} align="flex-start">
                    <DualRangeSlider max={24 * 60} value={options.overlayHours} onChange={(overlayHours) => actions.merge({ overlayHours })} />
                    <TimeRange>
                        {overlayHoursStart}
                        &nbsp;&nbsp;
                        {' - '}
                        &nbsp;&nbsp;
                        {overlayHoursEnd}
                    </TimeRange>
                </FlexColumn>
            </Option>
        </Body>
    )
}