import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Divider, Row, Col, Select, Button, Steps, Input, message, Modal, Checkbox } from 'antd';
import { LuArrowLeftFromLine, LuSave, LuSaveAll } from "react-icons/lu";
import { FaGooglePlay } from "react-icons/fa";
import { TfiPencilAlt } from "react-icons/tfi";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { PiOpenAiLogo} from "react-icons/pi";
import { IoTimerSharp, IoCheckmarkDoneSharp, IoClose } from "react-icons/io5";
import { GiReturnArrow } from "react-icons/gi";
import './AutoEvaluation.css';
import ReturnPrePage from './Feature/Course/ReturnPage';

const { Option } = Select;

const AutoEvaluation = () => {
  const [database, setDatabase] = useState([
    {
      "Student Name": ["A", "A", "A", "A", "A", "A"],
      "Student ID": ["1", "1", "1", "2", "2", "2"],
      "Student Work": [
        `
    /*  
    1.[REMOVED] (2.[REMOVED])
    3.[REMOVED]
    Intro to 4.[REMOVED]
    */
    #include <stdio.h>
    
    int main() {
        float num1, num2, num3;
        printf("Enter three float numbers: ");
        scanf("%f %f %f", &num1, &num2, &num3);
    
        printf("A number is the sum of the others: ");
        
        // Check all 5.[REMOVED] and print 6.[REMOVED] result
        if (num1 + num2 == num3) {
            printf("YES");
        } else if (num1 + num3 == num2) {
            printf("YES");
        } else if (num2 + num3 == num1) {
            printf("YES");
        } else
            printf("NO");
    
        printf("\\n");
    
        return 0;
    }`,
        "abcdef",
        "abcedefasdfsf"
      ],
      "Question ID": ["1", "2", "3", "1", "2", "3"],
      "Question Score": ["8/8", "7.5/8", "5/8", "7/8", "6/8", "8/8"],
      "Question Feedbacks": [
        `
    - The code follows the requirements and produces the correct results for all inputs tested.
    - The program efficiently performs the required tasks.
    - The variable names (num1, num2, num3) 
    `,
        "abcdef",
        "abcedefasdfsf"
      ],
      "Re-evaluation Instructions": ["", "", "", "", "", ""]
    }
  ]);

  const students = useMemo(() => {
    return Array.from(new Set(database[0]["Student Name"].map((name, index) => `${name} (${database[0]["Student ID"][index]})`)));
  }, [database]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState("");
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [editedScore, setEditedScore] = useState("");
  const [reAeEnabled, setReAeEnabled] = useState(false);
  const [reAeInstructions, setReAeInstructions] = useState("");
  const [isEditingReAe, setIsEditingReAe] = useState(false);
  const [neverAskAgain, setNeverAskAgain] = useState(false);
  const [neverAskAgainChecked, setNeverAskAgainChecked] = useState(false);   
  const selectedStudent = students[selectedStudentIndex];
  const selectedStudentId = selectedStudent.match(/\(([^)]+)\)$/)[1]; 

  const studentQuestions = database[0]["Student ID"].map((id, index) => {
    if (id === selectedStudentId) {
      return {
        work: database[0]["Student Work"][index],
        questionId: database[0]["Question ID"][index],
        questionScore: database[0]["Question Score"][index],
        questionFeedback: database[0]["Question Feedbacks"][index],
        reAeInstructions: database[0]["Re-evaluation Instructions"][index] // Include reAeInstructions
      };
    }
    return null;
  }).filter(item => item !== null);  

  const selectStudentWork = useCallback((value) => {
    const newIndex = students.indexOf(value);
    setSelectedStudentIndex(newIndex);
    setCurrentQuestionIndex(0);
    const initialInstructions = studentQuestions[newIndex].reAeInstructions || "";
    setReAeInstructions(initialInstructions);
  }, [students, studentQuestions]);
  
  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prevIndex => {
      const newIndex = Math.min(prevIndex + 1, studentQuestions.length - 1);
      setReAeInstructions(studentQuestions[newIndex].reAeInstructions || "");
      return newIndex;
    });
  }, [studentQuestions]);
  
  const prevQuestion = useCallback(() => {
    setCurrentQuestionIndex(prevIndex => {
      const newIndex = Math.max(prevIndex - 1, 0);
      setReAeInstructions(studentQuestions[newIndex].reAeInstructions || "");
      return newIndex;
    });
  }, [studentQuestions]);
  
  const nextStudent = useCallback(() => {
    setSelectedStudentIndex(prevIndex => Math.min(prevIndex + 1, students.length - 1));
    setCurrentQuestionIndex(0);
  }, [students.length]);
  
  const prevStudent = useCallback(() => {
    setSelectedStudentIndex(prevIndex => Math.max(prevIndex - 1, 0));
    setCurrentQuestionIndex(0);
  }, []);
  
  const startEditingFeedback = useCallback(() => {
    setIsEditingFeedback(true);
    setEditedFeedback(studentQuestions[currentQuestionIndex].questionFeedback);
    const [actualScore, maxScore] = studentQuestions[currentQuestionIndex].questionScore.split('/');
    setIsEditingScore(true);
    setEditedScore(actualScore);
  }, [studentQuestions, currentQuestionIndex]);
  
  const cancelEditingFeedback = useCallback(() => {
    setIsEditingFeedback(false);
    setIsEditingScore(false);
    setEditedFeedback("");
    setEditedScore("");
  }, []);
  
  const saveFeedback = useCallback(() => {
    const updatedQuestions = [...studentQuestions];
    const [actualScore, maxScore] = studentQuestions[currentQuestionIndex].questionScore.split('/').map(Number);
  
    if (editedScore === '' || isNaN(Number(editedScore)) || Number(editedScore) > maxScore || Number(editedScore) < 0) {
      message.error('Invalid score input. Please enter a number between 0 and the maximum score.');
      setEditedScore(''); // Clear the input box
      return;
    }
  
    updatedQuestions[currentQuestionIndex].questionScore = `${editedScore}/${maxScore}`;
    updatedQuestions[currentQuestionIndex].questionFeedback = editedFeedback;
    const newDatabase = [...database];
    newDatabase[0]["Question Feedbacks"] = updatedQuestions.map(question => question.questionFeedback);
    newDatabase[0]["Question Score"] = updatedQuestions.map(question => question.questionScore);
    setDatabase(newDatabase);
    setIsEditingFeedback(false);
    setIsEditingScore(false);
  }, [editedFeedback, editedScore, studentQuestions, currentQuestionIndex, database]);
  
  const enableReAeInstructions = useCallback(() => {
    setReAeEnabled(true);
    setIsEditingReAe(true);
  }, []);
  
  const disableReAeInstructions = useCallback(() => {
    setReAeEnabled(false);
    setReAeInstructions(studentQuestions[currentQuestionIndex].reAeInstructions || "");
  }, [studentQuestions, currentQuestionIndex]);
  
  const saveReAeInstructions = useCallback(() => {
    const newDatabase = [...database];
    newDatabase[0]["Re-evaluation Instructions"][currentQuestionIndex] = reAeInstructions;
    setDatabase(newDatabase);
    setIsEditingReAe(false);
  }, [reAeInstructions, currentQuestionIndex, database]);
  
  const saveMarkCurStu = useCallback(() => {
    const studentId = selectedStudentId;
    const updatedData = {
      "Student Name": [],
      "Student ID": [],
      "Student Work": [],
      "Question ID": [],
      "Question Score": [],
      "Question Feedbacks": [],
      "Re-evaluation Instructions": [] // Ensure this is included
    };
  
    for (let i = 0; i < database[0]["Student ID"].length; i++) {
      if (database[0]["Student ID"][i] !== studentId) {
        updatedData["Student Name"].push(database[0]["Student Name"][i]);
        updatedData["Student ID"].push(database[0]["Student ID"][i]);
        updatedData["Student Work"].push(database[0]["Student Work"][i]);
        updatedData["Question ID"].push(database[0]["Question ID"][i]);
        updatedData["Question Score"].push(database[0]["Question Score"][i]);
        updatedData["Question Feedbacks"].push(database[0]["Question Feedbacks"][i]);
        updatedData["Re-evaluation Instructions"].push(database[0]["Re-evaluation Instructions"][i]);
      }
    }
  
    setDatabase([updatedData]);
    setSelectedStudentIndex(0);
    setCurrentQuestionIndex(0);
  }, [database, selectedStudentId]);
  
  const confirmSaveMarkCurStu = useCallback(() => {
    Modal.confirm({
      title: 'Are you satisfied with the result from the evaluation?',
      content: (
        <div>
          <p>If you don’t have any modifications on the feedback, the result will go to the final database.</p>
          <Checkbox
            onChange={(e) => {
              const isChecked = e.target.checked;
              setNeverAskAgainChecked(isChecked);
            }}
          >
            Never ask me again
          </Checkbox>
        </div>
      ),
      className: 'custom-modal', 
      okButtonProps: { className: 'custom-ok-button' },
      onOk() {
        if (neverAskAgainChecked) {
          setNeverAskAgain(true);
        }
        saveMarkCurStu();
      },
    });
  }, [neverAskAgainChecked, saveMarkCurStu]);
  
  const onSaveMarkCur = useCallback(() => {
    const neverAskAgain = localStorage.getItem('neverAskAgain') === 'true';
    if (neverAskAgain) {
      saveMarkCurStu();
    } else {
      confirmSaveMarkCurStu();
    }
  }, [saveMarkCurStu, confirmSaveMarkCurStu]);
  
  
  const saveAllMarkStu = () => {
    Modal.confirm({
      title: 'Confirm Save All Evaluations',
      content: (
        <div>
          <p>If you don’t have any modifications on the feedbacks, all the evaluation work will go directly to the final database.</p>
        </div>
      ),
      className: 'custom-modal', 
      okButtonProps: { className: 'custom-ok-button' },
      onOk() {
        // Functionality to remove all students and save to the database
        const updatedData = {
          "Student Name": [],
          "Student ID": [],
          "Student Work": [],
          "Question ID": [],
          "Question Score": [],
          "Question Feedbacks": [],
          "Re-evaluation Instructions": []
        };
        setDatabase([updatedData]);
        setSelectedStudentIndex(0);
        setCurrentQuestionIndex(0);
        console.log('All results saved to final database.');
      },
      onCancel() {
        console.log('Save cancelled.');
      },
    });
  }
  
  return (
    <>
      {/*previous page return*/}
      <div className='manage-page-state'>
        <LuArrowLeftFromLine className='returnpage-icon' size={25} onClick={ReturnPrePage} />
      </div>

      <Divider orientation='left' style={{ marginTop: '-30px', marginBottom: '-60px', paddingLeft: '30px' }}>
        <Steps
          className="eva-progress"
          current={0}
          items={[
            {
              icon: <IoTimerSharp />,
              title: 'Auto-evaluation',
            },
          ]}
        />
      </Divider>

      <div className='search-box'>
        <Select
          className='search-box-component'
          showSearch
          style={{ width: 300 }}
          placeholder="Search to select Student "
          optionFilterProp="children"
          onChange={selectStudentWork}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={students[selectedStudentIndex]} 
        >
          {students.map((student, index) => (
            <Option key={index} value={student}>{student}</Option>
          ))}
        </Select>
        <Button
          type="primary"
          icon={<FaCaretLeft />}
          className='pre-student'
          size="small"
          onClick={prevStudent}
          disabled={selectedStudentIndex === 0}
        />
        <Button
          type="primary"
          icon={<FaCaretRight />}
          className='next-student'
          size="small"
          onClick={nextStudent}
          disabled={selectedStudentIndex === students.length - 1}
        />
        <p className='dvider-line'>|</p>
        <Button
          type="primary"
          icon={<LuSaveAll className='icon-save-all' />}
          className='save-all-mark-student'
          size="small"
          onClick={saveAllMarkStu}
        >
          Save all
        </Button>
      </div>

      <div className='pp-container'>
        <Row>
          <Col span={13}>
            <div className='Student-Work-Header'>
              <p className='question-marks'>
                <b>Question {studentQuestions[currentQuestionIndex].questionId}: </b>
                {isEditingScore ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Input
                      value={editedScore}
                      onChange={e => setEditedScore(e.target.value)}
                      style={{
                        padding: '5px',
                        width: '25px', 
                        height: '18px', 
                        color: isNaN(Number(editedScore)) || Number(editedScore) > Number(studentQuestions[currentQuestionIndex].questionScore.split('/')[1]) || Number(editedScore) < 0 ? 'red' : 'black' 
                      }}
                    />
                    /{studentQuestions[currentQuestionIndex].questionScore.split('/')[1]}
                  </div>
                ) : (
                  `${studentQuestions[currentQuestionIndex].questionScore} pts`
                )}
              </p>
              <div className='question-manage'>
                <Button
                  type="primary"
                  icon={<FaCaretLeft />}
                  className='pre-question'
                  size="small"
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                />
                <p className='cur-question'>{currentQuestionIndex + 1}/{studentQuestions.length}</p>
                <Button
                  type="primary"
                  icon={<FaCaretRight />}
                  className='next-question'
                  size="small"
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === studentQuestions.length - 1}
                />
              </div>
            </div>
            <div className='student-work-display'>
              <pre>{studentQuestions[currentQuestionIndex].work}</pre>
            </div>
          </Col>

          <Col span={10}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '50%' }}>
              <div className='Feedback-Header'>
                <p className='feedback'>Feedback on the question's solution:</p>
                {isEditingFeedback ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IoCheckmarkDoneSharp className='feedback-fix' onClick={saveFeedback} style={{ marginRight: '10px' }} />
                    <IoClose className='feedback-fix' onClick={cancelEditingFeedback} />
                  </div>
                ) : (
                  reAeEnabled ? 
                    <TfiPencilAlt  className='feedback-fix-disabled' /> :
                    <TfiPencilAlt className='feedback-fix' onClick={startEditingFeedback} />
                )}
              </div>
              <div className='question-feedbacks'>
                {isEditingFeedback ? (
                  <div style={{ flex: '1 1 auto' }}>
                    <Input.TextArea
                      value={editedFeedback}
                      onChange={e => setEditedFeedback(e.target.value)}
                      style={{ height: '100%',width: '100%', resize: 'none' }}
                    />
                  </div>
                ) : (
                  <pre style={{ maxWidth: '100%', whiteSpace: 'pre-wrap', margin: '10px' }}>{studentQuestions[currentQuestionIndex].questionFeedback}</pre>
                )}
              </div>
            </div>
            <div className='Re-AE'>
                {reAeEnabled ? (
                  <div className='Re-AE-Header'>
                      <div className='re-AE-note'>
                      <p><b>Re-evaluation's instruction:</b><br /> 
                      Please provide further instruction if you want to re-mark this work
                      </p>
                      </div>
                      {isEditingReAe && (
                        <IoCheckmarkDoneSharp className='re-Ae-fix' style={{ margin: '100x 20px 50px 0'}} onClick={saveReAeInstructions} />
                      )}
                  </div>
                ) : (
                  <div className='Re-AE-Header'>
                    <p className='re-AE-note'></p>
                  </div>
                )}
                  <Input.TextArea
                    className='re-AE-instruction'
                    style={{ height: '100%', width: '100%', resize: 'none'}}
                    disabled={!reAeEnabled}
                    value={reAeInstructions}
                    onChange={(e) => setReAeInstructions(e.target.value)}
                    onClick={enableReAeInstructions}
                  />
              </div>
          </Col>

          <Col>
            <div className='manage-bar-re-AE'>
              <Button
                className='manage-AE'
                type="primary"
                icon={<LuSave />}
                onClick={onSaveMarkCur}
              >
              </Button>
              {reAeEnabled ? (
                <div className='re-AE'>
                  <Button
                    className='manage-AE'
                    type="primary"
                    icon={<FaGooglePlay/>}
                    style = {{marginLeft: '7px'}}
                  >
                  </Button>
                  <Button
                    className='manage-AE'
                    type="primary"
                    icon={<GiReturnArrow />}
                    onClick={disableReAeInstructions}
                    style = {{marginLeft: '7px'}}
                  >
                  </Button>
                </div>
              ) : (
                <Button
                  className='manage-AE'
                  type="primary"
                  icon={<PiOpenAiLogo />}
                  onClick={enableReAeInstructions}
                  disabled={isEditingFeedback}
                >
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </div >
    </>
  );
};

export default AutoEvaluation;