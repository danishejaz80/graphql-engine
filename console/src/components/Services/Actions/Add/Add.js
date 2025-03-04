import React, { useEffect } from 'react';
import actionStyles from '../Actions.scss';
import styles from '../../../Common/Common.scss';
import Helmet from 'react-helmet';
import HandlerEditor from '../Common/components/HandlerEditor';
import KindEditor from '../Common/components/KindEditor';
import HeadersConfEditor from '../Common/components/HeaderConfEditor';
import Button from '../../../Common/Button';
import {
  setActionHandler,
  setActionKind,
  setDefaults,
  setActionDefinition,
  setTypeDefinition,
  setHeaders as dispatchNewHeaders,
  toggleForwardClientHeaders as toggleFCH,
  resetDerivedActionParentOperation,
  setActionComment,
} from './reducer';
import { createAction } from '../ServerIO';
import { getActionDefinitionFromSdl } from '../../../../shared/utils/sdlUtils';
import ToolTip from '../../../Common/Tooltip/Tooltip';
import { showWarningNotification } from '../../Common/Notification';
import GraphQLEditor from '../Common/components/GraphQLEditor';
import { actionDefinitionInfo } from '../Modify/ActionEditor';

export const typeDefinitionInfo = {
  label: 'New types definition',
  tooltip:
    'You can define new GraphQL types that you can use in the action definition above',
};

const AddAction = ({
  handler,
  dispatch,
  kind,
  actionDefinition,
  typeDefinition,
  isFetching,
  headers,
  forwardClientHeaders,
  derive,
  readOnlyMode,
  comment,
}) => {
  useEffect(() => {
    if (readOnlyMode)
      dispatch(
        showWarningNotification(
          'Adding new action is not allowed in Read only mode!'
        )
      );
  }, [dispatch, readOnlyMode]);
  useEffect(() => {
    if (!derive.operation) {
      dispatch(setDefaults());
    }
    return () => {
      dispatch(resetDerivedActionParentOperation());
    };
  }, []);

  const handlerOnChange = e => dispatch(setActionHandler(e.target.value));
  const kindOnChange = k => dispatch(setActionKind(k));
  const commentOnChange = e => dispatch(setActionComment(e.target.value));

  const {
    sdl: typesDefinitionSdl,
    error: typesDefinitionError,
    timer: typedefParseTimer,
  } = typeDefinition;

  const {
    sdl: actionDefinitionSdl,
    error: actionDefinitionError,
    timer: actionParseTimer,
  } = actionDefinition;

  const onSubmit = () => {
    dispatch(createAction());
  };

  const setHeaders = hs => {
    dispatch(dispatchNewHeaders(hs));
  };

  const toggleForwardClientHeaders = () => {
    dispatch(toggleFCH());
  };

  const actionDefinitionOnChange = (value, error, timer, ast) => {
    dispatch(setActionDefinition(value, error, timer, ast));
  };

  const typeDefinitionOnChange = (value, error, timer, ast) => {
    dispatch(setTypeDefinition(value, error, timer, ast));
  };

  const allowSave =
    !isFetching &&
    !typesDefinitionError &&
    !actionDefinitionError &&
    !actionParseTimer &&
    !readOnlyMode &&
    !typedefParseTimer;

  let actionType;
  if (!actionDefinitionError) {
    // TODO optimise
    if (!actionParseTimer) {
      const { type, error } = getActionDefinitionFromSdl(actionDefinitionSdl);
      if (!error) {
        actionType = type;
      }
    }
  }

  return (
    <div>
      <Helmet title="Add Action - Actions | Pantheon" />
      <h2
        className={`${styles.headerText} ${styles.display_inline} ${styles.add_mar_bottom_mid}`}
      >
        Add a new action
      </h2>
      <GraphQLEditor
        value={actionDefinitionSdl}
        error={actionDefinitionError}
        onChange={actionDefinitionOnChange}
        timer={actionParseTimer}
        readOnlyMode={readOnlyMode}
        label={actionDefinitionInfo.label}
        tooltip={actionDefinitionInfo.tooltip}
      />
      <hr />
      <GraphQLEditor
        value={typesDefinitionSdl}
        error={typesDefinitionError}
        timer={typedefParseTimer}
        onChange={typeDefinitionOnChange}
        readOnlyMode={readOnlyMode}
        label={typeDefinitionInfo.label}
        tooltip={typeDefinitionInfo.tooltip}
        allowEmpty
      />
      <hr />
      <div className={actionStyles.comment_container_styles}>
        <h2
          className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
        >
          Comment
        </h2>
        <input
          disabled={readOnlyMode}
          type="text"
          value={comment}
          onChange={commentOnChange}
          placeholder="comment"
          className={`form-control ${styles.inputWidthLarge}`}
        />
      </div>
      <hr />
      <HandlerEditor
        value={handler}
        onChange={handlerOnChange}
        placeholder="action handler"
        className={styles.add_mar_bottom_mid}
        service="create-action"
        disabled={readOnlyMode}
      />
      <hr />
      {actionType === 'query' ? null : (
        <React.Fragment>
          <KindEditor
            value={kind}
            onChange={kindOnChange}
            className={styles.add_mar_bottom_mid}
            disabled={readOnlyMode}
          />
          <hr />
        </React.Fragment>
      )}
      <HeadersConfEditor
        forwardClientHeaders={forwardClientHeaders}
        toggleForwardClientHeaders={toggleForwardClientHeaders}
        headers={headers}
        setHeaders={setHeaders}
        disabled={readOnlyMode}
      />
      <hr />
      <Button
        color="yellow"
        size="sm"
        type="submit"
        disabled={!allowSave}
        onClick={onSubmit}
        data-test="create-action-btn"
      >
        Create
      </Button>
      {readOnlyMode && (
        <ToolTip
          id="tooltip-actions-add-readonlymode"
          message="Adding new action is not allowed in Read only mode!"
        />
      )}
    </div>
  );
};

export default AddAction;
