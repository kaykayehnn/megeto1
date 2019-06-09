import React, { FunctionComponent, useMemo, useState } from 'react'
import { csvParse } from 'd3-dsv'
import {
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
} from '@material-ui/core'

import styles from './Schedule.module.scss'
import Content from '@Components/Content'
import ScheduleType from 'types/Schedule'
import HashTable from 'types/HashTable'

const CSV_SCHEDULE = [
  `5а,5б,6а,6б,7а,8а,8б,8в,8г,8д,8е,8ж,8з,9а,9б,9в,9г,9д,9е,9ж,9з,10а,10б,10в,10г,10д,10е,10ж,10з,11a,11б,11в,11г,11д,11е,11ж,11з,12а,12б,12в,12г,12д,12е,12ж,12з
80,66/73,53,40,39,37,25,74/75,36,30,49,60,55,67/78,44,84,13,29,68,47,35,8,45,70/76,55,2,11,16,62,50,57,46,27,9,31,64,34,82,17,21,18,12,56,42,19
13,10,40,66/73,39,37,25,56,60,36,55,49,18,44,67/78,53,16,29,35,80,84,45,70/76,2,8,46,11,47,59/62,17,33,27,50,57,51,9,34,17,52,21,12,63/72,82,42,19
53,10,17,66/73,80,26,25,21,74/75,30,37,55,49,84,47,44,51,45,35,13,59/62,55,48,22,46,15,77/78,70/76,11,33,50,88,27,67/68,57,2,9,42,82,36,12,63/72,64/65,56,60/61
38,80,10,17,51,26,25,79,74/75,30,37,4,18,52,84,57,53,67/78,13,16,59/62,46,2,32,22,70/77,31,45,55,68/76,33,27,34,88,50,66/73,20,42,12,56,64/65,36,41,63/72,60/61
38,53,67/73,10,46,26,37,21,20,74/75,79,4,18,51,15,67/78,84,2,47,35,13,81,8,32,22,70/77,31,11,50,68/76,27,57,34,48,9,3,59/62,56,12,64/65,52,36,41,63/72,60/61
13,38,67/73,40,8,26,74/75,21,20,79,23,37,88,10,52,15,67/78,50,84,35,47,51,22,48,2,81,55,11,32,33,68/76,9,57,46,34,27,59/62,12,42,64/65,41,56,52,4,60/61
66/73,38,40,,8,60,79,21,20,56,23,37,88,47,51,57 чк,63/72,84,2,68,35,,,81,70/77,15 чк,46,55,32,9,27,50,,52,34,33,20,12,42,36,41,52,64/65,4,59/86
,,,,,,,,36 чк,,,,,,,,,,,35 чк,61 чк,,,,,,,76 чк,62,,,,,,,33,20 чк,,,,,,,,`,
  `5а,5б,6а,6б,7а,8а,8б,8в,8г,8д,8е,8ж,8з,9а,9б,9в,9г,9д,9е,9ж,9з,10а,10б,10в,10г,10д,10е,10ж,10з,11a,11б,11в,11г,11д,11е,11ж,11з,12а,12б,12в,12г,12д,12е,12ж,12з
60,80,87,40,8,26,69/71,21,79,11,53,4,18,52,55,44,13,47,70/76,2,62,II ч.ез,II ч.ез,II ч.ез,II ч.ез,II ч.ез,II ч.ез,II ч.ез,II ч.ез,83,9,27,34,34,46,66/73,64,42,63/72,12,41,30,31,14,59/61
13,87,80,40,60,26,25,21,69/71,11,79,4,18,10,52,44,47,45,70/76,16,2,46,21,74/75,8,43,49,48,55,II ч.ез,II ч.ез,II ч.ез,II ч.ез,II ч.ез,II ч.ез,66/73,64,42,63/72,12,41,30,31,14,59/61
13,19,10,80,8,26,25,69/71,20,30,14,4,79,II ч.ез,44,47,II ч.ез,29,II ч.ез,49,II ч.ез,45,74/75,51,43,55,2,66/73,60/62,48,68/76,52,52,9,83,64,34,17,42,53,18,12,54,63/72,41
80,38,10,87,19,79,25,21,20,30,23,11,88,44,II ч.ез,II ч.ез,55,II ч.ез,64/65,II ч.ез,49,45,8,46,43,48,51,66/73,60/62,68/76,47,9,9,52,34,74/75,3,17,42,54,18,12,14,4,59/61
87,38,60,10,66/73,26,25,14,20,69/71,50,79,88,44,49,15,16,45,23,64/65,13,24,46,8,22,28,43,81,47,52,68/76,27,27,83,34,74/75,2,53,54,21,12,63/72,41,4,59/61
38,10,40,64/65,39,14,69/71,32,20,30,23,50,53,55,44,49,16,13,23,70/76,24,2,45,22,81,15,43,66/73,60/62,47,52,46,46,28,9,74/75,83,12,17,21,54,63/72,41,42,59/61
38,,40,64/65,39,14,37,32,69/71,79,23,53,50,47,15,63/72,49,2,13,70/76,24,81,22,55,,42,,3,60/62,,83,34,34,28,48,27,9,12,17,21 чк,,54,41 чк,42,59/61
,,,,,,37,,,,,71 чк,,,,,,,,,,,,,,,,45,60/62,,,,,,,66 чк,34,,,,,,,,`,
]

// Copies Monday and Tuesday to fill the week
CSV_SCHEDULE.push(...CSV_SCHEDULE, CSV_SCHEDULE[0])

function parseSchedule(): [ScheduleType[], string[]] {
  const parsedSchedule = CSV_SCHEDULE.map(csv => csvParse(csv))
  const columns = parsedSchedule[0].columns

  const toHash = (p: HashTable<string[]>, c: string) => ((p[c] = []), p)

  const schedule: ScheduleType[] = []
  for (let day = 0; day < parsedSchedule.length; day++) {
    const currentDay: ScheduleType = columns.reduce(toHash, {})
    const parsedDay = parsedSchedule[day]
    for (let subjectIx = 0; subjectIx < parsedDay.length; subjectIx++) {
      for (let classNameIx = 0; classNameIx < columns.length; classNameIx++) {
        const className = columns[classNameIx]
        // "!" Assertion is based on the assumption that table is not jagged
        currentDay[className].push(parsedDay[subjectIx][className]!)
      }
    }

    schedule.push(currentDay)
  }

  return [schedule, columns]
}

const DAYS = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък']

export interface ScheduleProps {}

const Schedule: FunctionComponent<ScheduleProps> = () => {
  const [schedule, columns] = useMemo(parseSchedule, [])
  const [dayIndex, setDayIndex] = useState(0)

  return (
    <Content>
      <Typography variant='h1'>Програма</Typography>
      <Tabs
        value={dayIndex}
        variant='fullWidth'
        // textColor='inherit'
        indicatorColor='primary'
        onChange={(_event, newValue) => setDayIndex(newValue)}>
        {DAYS.map(d => (
          <Tab key={d} label={d} />
        ))}
      </Tabs>
      <Paper className={styles.table}>
        <Table>
          <TableHead>
            <TableRow>
              {/* Column for subject indices */}
              <TableCell className={styles.stickyCell} />
              {columns.map(c => (
                <TableCell key={c}>{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule[dayIndex][columns[0]].map((_, classIx) => (
              <TableRow key={classIx}>
                {/* Subject index */}
                <TableCell className={styles.stickyCell}>
                  {classIx + 1}
                </TableCell>
                {columns.map((c, ix) => (
                  <TableCell key={ix} className={styles.tableCell}>
                    {schedule[dayIndex][c][classIx] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Content>
  )
}

export default Schedule
