import styled from "styled-components"
import { useOptions } from "../../hooks/useOptions"
import { Input } from "../atoms/Input"
import { FlexRow } from "../atoms/Layout"
import { InfoText, Label } from "../atoms/Typography"
import { Option } from "../atoms/Option"

const Select = styled.select`
    width: 200px;
`
const Table = styled.table`
    width: 100%;
    margin-top: 8px;
`
const Cell = styled.td`
    text-align: center;
`
const HeadCell = styled.th`
    text-align: center;
    padding-bottom: 4px;
`

export const AppOptionsSection: React.FC = () => {
    const { data: options, actions } = useOptions()

    return (
        <>
            <Option>
                <Label>Hotkeys</Label>
                <InfoText>
                    <p>Following Hotkeys are registered:</p>
                    <Table>
                        <tr>
                            <HeadCell>Stop Tracking</HeadCell>
                            <HeadCell>Track First Issue</HeadCell>
                            <HeadCell>Track Second Issue</HeadCell>
                            <HeadCell>Track Third Issue</HeadCell>
                        </tr>
                        <tr>
                            <Cell>CTRL+SHIFT+0</Cell>
                            <Cell>CTRL+SHIFT+1</Cell>
                            <Cell>CTRL+SHIFT+2</Cell>
                            <Cell>CTRL+SHIFT+3</Cell>
                        </tr>
                    </Table>
                </InfoText>
            </Option>
            <Option>
                <Label>Extended Comments</Label>
                <InfoText>Show comments in the worklog list and show an input field for entering a comment while tracking.</InfoText>
                <FlexRow $justify="flex-start">
                    <Input style={{ margin: '0 6px' }} type="checkbox" checked={options.showComments} onChange={(e) => actions.merge({ showComments: e.target.checked })} />
                    <Label>enabled</Label>
                </FlexRow>
            </Option>
            <Option>
                <Label>Automatic Synchronization</Label>
                <FlexRow $justify="flex-start">
                    <Input style={{ margin: '0 6px' }} type="checkbox" disabled={isFirefox} checked={isFirefox ? false : options.autosync} onChange={(e) => actions.merge({ autosync: e.target.checked })} />
                    <Label>enabled</Label>
                </FlexRow>
                {isFirefox && <InfoText>For Firefox this setting is always inactive. Due to browser restrictions it is neccesary to open jira in a new tab and use that tab for synchronization.</InfoText>}
            </Option>
            <Option>
                <Label>Theme</Label>
                <Select onChange={(e) => actions.merge({ theme: e.target.value })}>
                    <option selected={options.theme === "DEFAULT"} value="DEFAULT">Light Theme (default)</option>
                    <option selected={options.theme === "DARK"} value="DARK">Dark Theme</option>
                </Select>
            </Option>
        </>
    )
}