import React, { useState, useEffect } from "react";
import {
  Divider,
  Row,
  Col,
  Select,
  Checkbox,
  Button,
  Steps,
  Modal,
  Input,
  Upload,
  Form,
} from "antd";
import { GiSpiderFace } from "react-icons/gi";
import { UploadOutlined } from "@ant-design/icons";
import { LuArrowLeftFromLine, LuSaveAll, LuSave } from "react-icons/lu";
import {
  FaArrowRightToBracket,
  FaCaretLeft,
  FaCaretRight,
} from "react-icons/fa6";
import { FaGooglePlay } from "react-icons/fa";
import { BsPersonLock } from "react-icons/bs";
import { IoTimerSharp } from "react-icons/io5";
import "./PrivacyProtection.css";
import {
  StudentAnswerEndpoint,
  PrivacyEndpoint,
} from "../../constants/endpoints";
import ReturnPrePage from "../Course/ReturnPage";
import request from "../../utils/request";
import { useParams } from "react-router-dom";

function highlightSensitiveDataRemoved(text) {
  const regex = /(\d+\.\[REMOVED\])/g;
  const replacer = (match) => {
    const [id, word] = match.split(".");
    return `<strong>${id}.<span style="color: #a00909">${word}</span></strong>`;
  };
  const highlightedText = text.replace(regex, replacer);
  return { __html: highlightedText };
}

const PrivacyProtection = () => {
  const { Option } = Select;
  const defaultFileIndex = 0; // Set the default file index for selecting file
  const [selectedFileIndex, setSelectedFileIndex] = useState(defaultFileIndex);
  const [checkedList, setCheckedList] = useState([]);
  const [checkedListIds, setCheckedListIds] = useState([]);

  // const [database, setDatabase] = useState([])
  // const [sensitiveDataRemoved, setSensitiveDataRemoved] = useState(null);
  // const [modifiedStudentWork, setModifiedStudentWork] = useState(null);
  const [database, setDatabase] = useState(null);
  const [sensitiveDataRemoved, setSensitiveDataRemoved] = useState(null);
  const [modifiedStudentWork, setModifiedStudentWork] = useState(null);
  const [studentWork, setStudentWork] = useState(null);

  const [transferredData, setTransferredData] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(1);
  const [isFileSaved, setIsFileSaved] = useState(null); // Track save state for each file
  const [isAllSaved, setIsAllSaved] = useState(false); // Track if all files are saved
  //asm marking criteria and questions:
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const { assignmentID } = useParams();

  const [sensitiveDataItems, setSensitiveDataItems] = useState([]);
  const [keyCount, setKeyCount] = useState(0);

  const fetchPrivacyInfo = async () => {
    const endpoint = StudentAnswerEndpoint["getByAssignment"];
    const resp = await request.get(`${endpoint}/${assignmentID}`);
    setDatabase(resp);
    setSensitiveDataRemoved(resp["Sensitive Data Removed"][selectedFileIndex]);
    setModifiedStudentWork(resp["Student Work"][defaultFileIndex]);
    setStudentWork(resp["original_student_work"][defaultFileIndex]);

    setIsFileSaved(resp["File Name"].map(() => false));
  };

  useEffect(() => {
    setSensitiveDataItems(sensitiveDataRemoved);
  }, [sensitiveDataRemoved]);

  useEffect(() => {
    fetchPrivacyInfo();
  }, [assignmentID, keyCount]);

  useEffect(() => {
    if (!database) return;
    setModifiedStudentWork(database["Student Work"][selectedFileIndex]);
    setStudentWork(database["original_student_work"][selectedFileIndex]);
    setCheckedList([]);
    setSensitiveDataRemoved(
      database["Sensitive Data Removed"][selectedFileIndex]
    );
  }, [database, selectedFileIndex]);

  const selectStudentWork = (value) => {
    const selectedIndex = database["File Name"].indexOf(value);
    setSelectedFileIndex(selectedIndex);
    setCurrentFileIndex(selectedIndex + 1);
  };

  const goToPreviousFile = () => {
    if (currentFileIndex > 1) {
      const newFileIndex = currentFileIndex - 2; // Subtract 2 because array indices are 0-based
      selectStudentWork(database["File Name"][newFileIndex]);
    }
  };

  const goToNextFile = () => {
    if (currentFileIndex < database["File Name"].length) {
      const newFileIndex = currentFileIndex; // No need to add 1 because array indices are 0-based
      selectStudentWork(database["File Name"][newFileIndex]);
    }
  };

  // const sensitiveDataItems = sensitiveDataRemoved.split('\n').filter(item => item.trim() !== '');
  const checkAll =
    sensitiveDataItems && sensitiveDataItems.length === checkedList.length;
  const indeterminate =
    checkedList.length > 0 && checkedList.length < sensitiveDataItems.length;

  const onChange = (id, item) => {
    setCheckedList(
      checkedList.includes(item)
        ? checkedList.filter((checkedItem) => checkedItem !== item)
        : [...checkedList, item]
    );
    setCheckedListIds(
      checkedListIds.includes(id)
        ? checkedListIds.filter((checkedItem) => checkedItem !== id)
        : [...checkedListIds, id]
    );
  };

  const checkAllSensiData = (e) => {
    setCheckedList(e.target.checked ? sensitiveDataItems : []);
  };

  const transferCheckedWords = () => {
    console.log(checkedList);
    console.log(checkedListIds);
    let newStudentWork = database["Student Work"][selectedFileIndex];
    checkedList.forEach((item) => {
      const id = parseInt(item.split(".")[0]);
      const word = item.split(".")[1];
      const regex = new RegExp(`${id}\\.\\[REMOVED\\]`, "g");
      newStudentWork = newStudentWork.replace(regex, `${word}`);
    });
    setModifiedStudentWork(newStudentWork);
    setTransferredData([...transferredData, ...checkedList]);
    // setCheckedList([]); // Clear checked list after transfer
    // setCheckedListIds([]);
  };

  const saveTransferredData = async () => {
    if (
      window.confirm(
        "Once you save, you cannot modify the current file anymore. Are you sure you want to save?"
      )
    ) {
      // const updatedSensitiveData = sensitiveDataItems.filter(item => !transferredData.includes(item)).join('\n');
      // setSensitiveDataRemoved(updatedSensitiveData);
      // database["Sensitive Data Removed"][selectedFileIndex] = updatedSensitiveData; // update the sensitive data
      // setTransferredData([]); // clear the transferred data after saving
      // setCheckedList([]); // clear the checked list after saving
      // setCheckedListIds([]);
      // setIsFileSaved(prevState => {
      //     const newState = [...prevState];
      //     newState[selectedFileIndex] = true;
      //     return newState;
      // });
      const endpoint = PrivacyEndpoint["privacyUpdate"];
      const payload = {
        removed_word_ids: checkedListIds,
        modified_student_work: modifiedStudentWork,
      };
      await request.post(`${endpoint}`, payload);
      setTransferredData([]);
      setCheckedList([]);
      setCheckedListIds([]);
      setKeyCount(keyCount + 1);
    }
  };

  const saveAllFiles = () => {
    if (
      window.confirm(
        "Once you save all files, you cannot modify them anymore. Are you sure you want to save all?"
      )
    ) {
      setIsAllSaved(true); // Disable transfer buttons for all files
      setIsFileSaved(database["File Name"].map(() => true)); // Set all files as saved
    }
  };

  const inputData4AI = () => {
    setIsModalOpen(true);
  };

  const acptData4AI = () => {
    setIsModalOpen(false);
    setInstruction("");
  };

  const cancelData4AI = () => {
    setIsModalOpen(false);
    setInstruction("");
  };

  const onInstructionInput = (instructionin) => {
    setInstruction(instructionin.target.value);
  };

  return (
    database &&
    modifiedStudentWork &&
    sensitiveDataRemoved && (
      <>
        {/*previous page return*/}
        <div className="manage-page-state">
          <LuArrowLeftFromLine
            className="returnpage-icon"
            size={25}
            onClick={ReturnPrePage}
          />
        </div>

        <Divider
          orientation="left"
          style={{
            marginTop: "-14px",
            marginBottom: "-48px",
            paddingLeft: "30px",
          }}
        >
          <Steps
            className="eva-progress"
            current={0}
            items={[
              {
                icon: <BsPersonLock />,
                title: "Privacy Protection",
              },
            ]}
          />
        </Divider>

        <div className="search-box">
          <Select
            className="search-box-component"
            showSearch
            style={{ width: 300 }}
            placeholder="Search to Select"
            optionFilterProp="children"
            onChange={(value) => selectStudentWork(value)}
            defaultValue={database["File Name"][defaultFileIndex]}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {database["File Name"].map((fileName, index) => (
              <Option key={index} value={fileName}>
                {fileName}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<FaCaretLeft />}
            className="pre-file"
            size="small"
            onClick={goToPreviousFile}
            disabled={currentFileIndex === 1}
          />
          <p className="cur-file">
            {currentFileIndex}/{database["File Name"].length}
          </p>
          <Button
            type="primary"
            icon={<FaCaretRight />}
            className="next-file"
            size="small"
            onClick={goToNextFile}
            disabled={currentFileIndex === database["File Name"].length}
          />
          <p className="dvider-line">|</p>
          <Button
            type="primary"
            icon={<LuSaveAll className="icon-save-all" />}
            className="save-all"
            size="small"
            onClick={saveTransferredData}
            disabled={isAllSaved}
          >
            Save
          </Button>

          {isAllSaved ? (
            <FaGooglePlay
              className="auto-eva-progress"
              onClick={inputData4AI}
            />
          ) : (
            <FaGooglePlay className="auto-eva-progress-disabled" />
          )}
        </div>

        <div className="pp-container">
          <Row>
            {/* <Col span={9}>
              <div className="Student-Work-Header">
                <div>
                  <p className="student-work-info">Asm Name (Asm ID) </p>
                </div>
              </div>
              <div className="student-work-display">
                <pre
                  dangerouslySetInnerHTML={highlightSensitiveDataRemoved(
                    studentWork
                  )}
                ></pre>
              </div>
            </Col> */}
            <Col span={5}>
              <div className="Sensitive-Data-Removed-Header">
                <p className="count-removed-data">
                  {sensitiveDataItems && sensitiveDataItems.length} items
                </p>
                <Row className="label-sdr">
                  <Col span={3}>
                    <Checkbox
                      indeterminate={indeterminate}
                      onChange={checkAllSensiData}
                      checked={checkAll}
                    />
                  </Col>
                  <Col span={2}>
                    <div className="label-sdr-1">
                      <b>ID</b>
                    </div>
                  </Col>
                  <Col span={5}>
                    <div className="label-sdr-1">
                      <b>Sensitive Data</b>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="sensitive-data-removed">
                {sensitiveDataItems &&
                  sensitiveDataItems.map((item, index) => {
                    const id = item.split(".")[0];
                    const order = item.split(".")[1];
                    const data = item.split(".")[2];
                    item = item.split(".").slice(1).join(".");
                    return (
                      <Row key={index} className="sdr">
                        <Col span={3}>
                          <Checkbox
                            checked={checkedList.includes(item)}
                            onChange={() => onChange(id, item)}
                          />
                        </Col>
                        <Col span={2}>{order}</Col>
                        <Col span={5} className="sdr-display">
                          {data}
                        </Col>
                      </Row>
                    );
                  })}
              </div>
            </Col>
            <Col>
              <div className="Transfer-sensi-word">
                <Button
                  type="primary"
                  icon={<FaArrowRightToBracket className="arrowright" />}
                  onClick={transferCheckedWords}
                  disabled={isFileSaved[selectedFileIndex] || isAllSaved}
                />
              </div>
            </Col>

            <Col span={18}>
              <div className="Student-Work-Header">
                <div>
                  <p className="student-work-info">Asm Name (Asm ID) </p>
                  {/* <div className='icon-save'><LuSave className='icon-save' onClick={saveTransferredData} disabled={isFileSaved[selectedFileIndex]}/></div> */}
                </div>
              </div>
              <div className="student-work-display">
                <pre
                  dangerouslySetInnerHTML={highlightSensitiveDataRemoved(
                    modifiedStudentWork
                  )}
                ></pre>
              </div>
            </Col>
          </Row>
        </div>

        <Modal
          className="custom-modal-eva-progress"
          title="Evaluation Progress"
          open={isModalOpen}
          onOk={acptData4AI}
          onCancel={cancelData4AI}
          okButtonProps={{ className: "custom-ok-button" }}
          width={650}
        >
          <Steps
            className="eva-progress"
            current={1}
            items={[
              {
                icon: <BsPersonLock />,
                title: "Privacy Protection",
              },
              {
                icon: <IoTimerSharp />,
                title: "Auto-evaluation",
              },
            ]}
          />
          <Form layout="vertical">
            <GiSpiderFace className="rmit-spider" />
            <p className="intro-ai">
              Hello! I’m your digital assistant for today’s assignment marking.
              My goal is to make your evaluation process as smooth and accurate
              as possible. Please provide clear and in-depth instructions for
              the evaluation process. Your detailed guidance will ensure that
              the auto-evaluation aligns with your expectations and standards.
              Let’s get started on this journey towards efficient and effective
              assignment marking!
            </p>
            <Form.Item label="Instructions" className="instruction-input">
              <Input.TextArea
                showCount
                maxLength={4000}
                onChange={onInstructionInput}
                style={{ marginBottom: "-10px" }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </>
    )
  );
};

export default PrivacyProtection;
