import { useParams, useHistory } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Box,
    Button,
    Card,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddLessonForm from './AddLessonForm/AddLessonForm';
import AddContentForm from './AddContentForm/AddContentForm';
import LoadingBar from '../LoadingBar/LoadingBar';
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import accessLevel from "../../config";

function UnitPage() {
    const { id, studentId } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    const unit = useSelector(store => store.unit);
    const user = useSelector(store => store.user);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const isLoading = useSelector((store) => store.loadingReducer);
    const progressByLesson = useSelector((store) => store.progressReducer);

    const [lessonToEdit, setLessonToEdit] = useState({ id: 0, lessonName: '', lessonDescription: '' });
    const [contentToEdit, setContentToEdit] = useState({ id: 0, contentName: '', contentDescription: '' });
    const [lessonToSwap, setLessonToSwap] = useState({ lessonId: 0, order: 0 });
    const [contentToSwap, setContentToSwap] = useState({ contentId: 0, lessonId: 0, order: 0 });
    const [swappingContent, setSwappingContent] = useState(false);
    const [draggable, setDraggable] = useState(true);
    const [unitId, setUnitId] = useState(0);
    const [lessonId, setLessonId] = useState(0);

    useEffect(() => {
        dispatch({
            type: "GET_UNIT",
            payload: id
        });
        dispatch({
            type: "GET_STUDENTS_UNIT_PROGRESS",
            payload: { studentId: studentId, unitId: id }
        });
    }, []);

    const selectContent = (unitId, lessonId, contentId) => {
        history.push({
            pathname: `/unit/${unitId}/lesson/${lessonId}/content/${contentId}`
        });
    };

    const editLesson = (ids) => {
        dispatch({
            type: "UPDATE_LESSON",
            payload: { ids, lessonToEdit }
        });

        setLessonToEdit({ id: 0, lessonName: '', lessonDescription: '' });
    };

    const editContent = (ids) => {
        dispatch({
            type: "UPDATE_CONTENT",
            payload: { ids, contentToEdit }
        });

        setContentToEdit({ id: 0, contentName: '', contentDescription: '' });
    };

    const cancelEdit = () => {
        setLessonToEdit({ id: 0, lessonName: '', lessonDescription: '' });
        setContentToEdit({ id: 0, contentName: '', contentDescription: '' });
        setDraggable(true);
    };

    const deleteLesson = (ids) => {
        dispatch({
            type: "DELETE_LESSON",
            payload: ids
        });
    };

    const deleteContent = (ids) => {
        dispatch({
            type: "DELETE_CONTENT",
            payload: ids
        });
    };

    const swapLessons = (otherLessonToSwap) => {
        if (!swappingContent) {
            dispatch({
                type: "SWAP_LESSONS",
                payload: { lessonId: lessonToSwap.lessonId, order: otherLessonToSwap.order, unitId: otherLessonToSwap.unitId }
            });

            dispatch({
                type: "SWAP_LESSONS",
                payload: { lessonId: otherLessonToSwap.lessonId, order: lessonToSwap.order, unitId: otherLessonToSwap.unitId }
            });
        }
    };

    const swapContent = (otherContentToSwap) => {
        if (swappingContent) {
            dispatch({
                type: "SWAP_CONTENT",
                payload: { contentId: contentToSwap.contentId, order: otherContentToSwap.order, lessonId: otherContentToSwap.lessonId, unitId: otherContentToSwap.unitId }
            });

            dispatch({
                type: "SWAP_CONTENT",
                payload: { contentId: otherContentToSwap.contentId, order: contentToSwap.order, lessonId: contentToSwap.lessonId, unitId: otherContentToSwap.unitId }
            });
        }
    };


    return (
        <Box sx={{
            "& .MuiButton-sizeMedium": {
                backgroundColor: colors.darkTealAccent[400],
                color: 'white'
            },
            "& .MuiButton-sizeMedium:hover": {
                backgroundColor: colors.darkTealAccent[600],
                color: 'white'
            }
        }}>


            <AddLessonForm id={id} />
            {isLoading ?
                <LoadingBar />
                :
                <AddContentForm unitId={unitId} lessonId={lessonId} />
            }

            {unit.map((lesson, i) => {
                return (
                    <div key={i}>
                        {/* unit header */}
                        {i === 0 ?
                            <Card id='unitHeader'>
                                <h1 style={{ fontWeight: 'bold', fontSize: 24, textDecoration: 'underline' }}
                                >{lesson.unitName}</h1>
                                <h2>{lesson.unitSubtitle}</h2>
                            </Card>
                            : <></>}

                        {/* start of lesson row */}
                        <Accordion id="accordion" >
                            {/* lesson header */}
                            <AccordionSummary
                                draggable={user.access === accessLevel.admin && draggable ? 'true' : 'false'}
                                onDragStart={() => {
                                    setLessonToSwap({ lessonId: lesson.lessonId, order: lesson.lessonOrder });
                                    setSwappingContent(false);
                                }}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => swapLessons({ lessonId: lesson.lessonId, order: lesson.lessonOrder, unitId: lesson.unitId })}
                                expandIcon={<ExpandMoreIcon sx={{ color: '#276184' }} />}
                            >
                                {draggable && user.access === accessLevel.admin ?
                                    <IconButton sx={{ padding: '0', marginRight: '16px', color: '#276184' }}>
                                        <DragHandleIcon sx={{ 'cursor': 'grab' }} />
                                    </IconButton> : <></>}

                                {/* lesson title */}
                                {lesson.lessonId !== lessonToEdit.id ?
                                    <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>
                                        {lesson.lessonName}
                                    </Typography> :
                                    <TextField
                                        onChange={(event) => setLessonToEdit({ ...lessonToEdit, lessonName: event.target.value })}
                                        className='lessonInputs' label='Lesson Name' value={lessonToEdit.lessonName}
                                    />
                                }
                            </AccordionSummary>
                            {/* end of lesson header */}

                            <AccordionDetails>
                                {/* lesson description */}
                                {lesson.lessonId !== lessonToEdit.id ?
                                    <Typography>
                                        {lesson.lessonDescription}
                                    </Typography> :
                                    <TextField onChange={(event) => setLessonToEdit({ ...lessonToEdit, lessonDescription: event.target.value })} className='lessonInputs' label='Lesson Description' value={lessonToEdit.lessonDescription} />
                                }


                                {lesson.contentId?.map((id, index) => {
                                    return (
                                        <div key={index} >

                                            {/* content row within a lesson */}
                                            {lesson.contentId[index] === null ? <></> :
                                                <div id='content'
                                                    draggable={user.access === accessLevel.admin && draggable ? 'true' : 'false'}
                                                    onDragStart={() => {
                                                        setContentToSwap({ contentId: id, lessonId: lesson.lessonId, order: unit[i].contentOrder[index] });
                                                        setSwappingContent(true);
                                                    }}
                                                    onDragOver={(event) => event.preventDefault()}
                                                    onDrop={() => swapContent({ contentId: id, order: unit[i].contentOrder[index], lessonId: lesson.lessonId, unitId: lesson.unitId })}
                                                >

                                                    {/* is required? is complete?  */}
                                                    {progressByLesson[i] === undefined ? <></> :
                                                        <>
                                                            {progressByLesson[i][index]?.isRequired ?
                                                                <>
                                                                    {progressByLesson[i][index]?.isComplete ?
                                                                        <div id="require">✓</div> :
                                                                        <div id="require"></div>
                                                                    }
                                                                </> :
                                                                <></>
                                                            }
                                                        </>
                                                    }

                                                    {draggable && user.access === accessLevel.admin ?
                                                        <IconButton id='dragIcon' sx={{ padding: '0', marginRight: '16px', color: 'white' }}>
                                                            <DragHandleIcon sx={{ cursor: 'grab', marginTop: 'auto', marginBottom: 'auto', }} />
                                                        </IconButton> : <></>}

                                                    {/* content shown on screen */}
                                                    {id !== contentToEdit.id ?
                                                        <div onClick={() => selectContent(lesson.unitId, lesson.lessonId, id)}>
                                                            <Typography id='contentTitle'>
                                                                {unit[i].contentTitle[index]}
                                                            </Typography>

                                                            {/* do we want description? */}
                                                            <Typography id='contentDescription'>
                                                                {unit[i].contentDescription[index]}
                                                            </Typography>
                                                        </div> :
                                                        <>
                                                            {/* content fields while editing */}
                                                            <div>
                                                                <TextField
                                                                    autoFocus
                                                                    variant="filled"
                                                                    margin="normal"
                                                                    type="text"
                                                                    label="Content Name"
                                                                    onChange={(event) => setContentToEdit({ ...contentToEdit, contentName: event.target.value })}
                                                                    className='lessonInputs'
                                                                    value={contentToEdit.contentName} />
                                                            </div>
                                                            <div>
                                                                <TextField
                                                                    autoFocus
                                                                    variant="filled"
                                                                    margin="normal"
                                                                    type="text"
                                                                    label="Content Description"
                                                                    onChange={(event) => setContentToEdit({ ...contentToEdit, contentDescription: event.target.value })}
                                                                    className='lessonInputs'
                                                                    value={contentToEdit.contentDescription} />
                                                            </div>
                                                        </>
                                                    }

                                                    {/* icons for content */}
                                                    {user.access === accessLevel.admin ?
                                                        <div id='contentIcons'>
                                                            {id !== contentToEdit.id ?
                                                                <>
                                                                    <IconButton onClick={() => setContentToEdit({ id: id, contentName: lesson.contentTitle[index], contentDescription: lesson.contentDescription[index] })}>
                                                                        <EditIcon sx={{ color: 'white' }} />
                                                                    </IconButton>
                                                                    <IconButton onClick={() => deleteContent({ contentId: id, unitId: lesson.unitId })}>
                                                                        <DeleteForeverIcon sx={{ color: 'white' }} />
                                                                    </IconButton>
                                                                </> :
                                                                <>
                                                                    <IconButton onClick={() => editContent({ contentId: id, unitId: lesson.unitId })}>
                                                                        <DoneIcon sx={{ color: 'white' }} />
                                                                    </IconButton>
                                                                    <IconButton onClick={cancelEdit} >
                                                                        <ClearIcon sx={{ color: 'white' }} />
                                                                    </IconButton>
                                                                </>
                                                            }
                                                        </div> : <></>}

                                                </div>
                                            }
                                        </div>
                                    );
                                })}

                                {/* button to add content row */}
                                {lesson.lessonName && user.access === accessLevel.admin ?
                                    <div id='lessonBottom'>
                                        {/* button to add content row */}
                                        <Button onClick={() => {
                                            dispatch({
                                                type: "SET_SHOW_ADD_CONTENT",
                                                payload: true,
                                            });
                                            setUnitId(lesson.unitId);
                                            setLessonId(lesson.lessonId);

                                        }}>
                                            Add Content to {lesson.lessonName}
                                        </Button>
                                        <div>
                                            {/* lesson icons */}
                                            {lesson.lessonId !== lessonToEdit.id ?
                                                <>

                                                    <IconButton onClick={() => {
                                                        setLessonToEdit({ id: lesson.lessonId, lessonName: lesson.lessonName, lessonDescription: lesson.lessonDescription });
                                                        setDraggable(false);
                                                    }}>
                                                        <EditIcon sx={{ color: '#276184' }} />
                                                    </IconButton>
                                                    <IconButton onClick={() => deleteLesson({ lessonId: lesson.lessonId, unitId: lesson.unitId })}>
                                                        <DeleteForeverIcon sx={{ color: '#276184' }} />
                                                    </IconButton>
                                                </> :
                                                <>

                                                    <IconButton onClick={() => {
                                                        editLesson({ lessonId: lesson.lessonId, unitId: lesson.unitId });
                                                        setDraggable(true);
                                                    }}>

                                                        <DoneIcon sx={{ color: '#276184' }} />
                                                    </IconButton>
                                                    <IconButton onClick={cancelEdit} >
                                                        <ClearIcon sx={{ color: '#276184' }} />
                                                    </IconButton>
                                                </>
                                            }
                                        </div>
                                    </ div>
                                    : <></>}
                            </AccordionDetails>
                        </Accordion>
                    </div>
                );
            })}

            <div id="addLessonParent">

                {user.access === accessLevel.admin ?
                    <Button
                        id='addLesson'
                        onClick={() => {
                            dispatch({
                                type: "SET_SHOW_ADD_LESSON",
                                payload: true,
                            });
                        }}
                    >
                        Add Lesson
                    </Button> : <></>}
            </div>

            <Button type="button"
                className="btn btn_asLink"
                onClick={() => history.push(`/course`)}>
                <Typography variant="body1">Back</Typography>
            </Button>


        </Box>

    );
}

export default UnitPage;
