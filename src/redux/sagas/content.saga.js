import axios from 'axios';
import { takeLatest, put } from 'redux-saga/effects';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// survey upload generator function
function* addContent(action) {
  console.log('action.payload', action.payload)
  try {
    yield put({ type: 'SET_LOADING_TRUE' });
    yield axios.post('/api/content', action.payload);
    yield put({ type: 'SET_LOADING_FALSE' });
    yield put({ type: 'GET_UNIT', payload: action.payload.unitId });
  } catch (error) {
    console.error('error posting content', error);
    yield put({ type: 'SET_LOADING_FALSE' });
  }
}

// video upload generator function
function* addContentWithUpload(action) {
  try {
    yield put({ type: 'SET_LOADING_TRUE' });
    const newFile = action.payload.contentToSend.content;
    const data = new FormData(); // IMPORTANT STEP! declare FormData
    data.append('file', newFile);
    data.append('title', action.payload.contentToSend.title);
    data.append('description', action.payload.contentToSend.description);
    data.append('isSurvey', action.payload.contentToSend.isSurvey);
    data.append('isRequired', action.payload.contentToSend.isRequired);
    data.append('lessons_id', action.payload.lessonId);

    yield axios.post('/api/content/file', data, {
      headers: {
        'content-type': 'multipart/form-data',
      },
    });
    yield put({ type: 'SET_LOADING_FALSE' });
    yield put({ type: 'GET_UNIT', payload: action.payload.unitId });
  } catch (error) {
    console.log('error uploading video', error);
    yield put({ type: 'SET_LOADING_FALSE' });
  }
}


// get content with id
function* getUnitLessonContent(action) {
  try {
    let response = yield axios.get(
      `/api/content/${action.payload.unitId}/${action.payload.lessonId}/${action.payload.contentId}`
    );
    yield put({ type: 'SET_CONTENT_VIEW', payload: response.data });
  } catch (error) {
    console.error('Error getting content', error);
  }
}

// delete content from a specific lesson
function* deleteContent(action) {
  const swal = withReactContent(Swal);
  try {
    let sweet = yield swal.fire({
      title: 'Are you sure you want to delete this content?',
      confirmButtonText: 'Delete',
      confirmButtonColor: '#D21304',
      cancelButtonColor: '#263549',
      showConfirmButton: true,
      showCancelButton: true,
    });
    if (sweet.isConfirmed) {
      yield axios.delete(`/api/content/${action.payload.contentId}`);
      yield put({ type: 'GET_UNIT', payload: action.payload.unitId });
    }
  } catch (error) {
    console.error('error deleting content', error);
  }
}

function* updateContent(action) {
  try {
    yield axios.put(
      `/api/content/${action.payload.ids.contentId}`,
      action.payload.contentToEdit
    );
    yield put({ type: 'GET_UNIT', payload: action.payload.ids.unitId });
  } catch (error) {
    console.error('Error updating content', error);
  }
}

function* swapContent(action) {
  try {
    yield axios.put(`/api/content`, action.payload);
    yield put({ type: 'GET_UNIT', payload: action.payload.unitId });
  } catch (error) {
    console.error('Error updating unit', error);
  }
}

function* contentSaga() {
  yield takeLatest('ADD_CONTENT', addContent);
  yield takeLatest('ADD_CONTENT_WITH_UPLOAD', addContentWithUpload);
  yield takeLatest('GET_UNIT_LESSON_CONTENT', getUnitLessonContent);
  yield takeLatest('DELETE_CONTENT', deleteContent);
  yield takeLatest('UPDATE_CONTENT', updateContent);
  yield takeLatest('SWAP_CONTENT', swapContent);
}

export default contentSaga;
