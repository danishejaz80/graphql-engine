import React, { useState } from 'react';
import Button from '../../../Common/Button/Button';
import { permissionTypes, getTableNameFromDef } from '../utils';
import metaDataStyles from '../Settings.scss';
import styles from '../../../Common/TableCommon/Table.scss';
import CheckIcon from '../../../Common/Icons/Check';
import CrossIcon from '../../../Common/Icons/Cross';
import { getConfirmation } from '../../../Common/utils/jsUtils';
import ReloadMetadata from '../MetadataOptions/ReloadMetadata';
import { dropInconsistentObjects } from '../../../../metadata/actions';

const MetadataStatus = ({ dispatch, metadata }) => {
  const [shouldShowErrorBanner, toggleErrorBanner] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const dismissErrorBanner = () => {
    toggleErrorBanner(false);
  };
  const inconsistentObjectsTable = () => {
    return (
      <table
        className={`${metaDataStyles.metadataStatusTable} ${metaDataStyles.wd750}`}
        id="t01"
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {metadata.inconsistentObjects.map((ico, _i) => {
            let name;
            let definition;
            if (ico.type === 'source') {
              name = ico.definition;
            }
            if (
              ico.type === 'object_relation' ||
              ico.type === 'array_relation'
            ) {
              name = ico.definition.name;
              definition = `relationship of table "${getTableNameFromDef(
                ico.definition.table
              )}"`;
            } else if (ico.type === 'remote_relationship') {
              name = ico.definition.name;
              definition = `relationship between table "${getTableNameFromDef(
                ico.definition.table
              )}" and remote schema "${ico.definition.remote_schema}"`;
            } else if (permissionTypes.includes(ico.type)) {
              name = `${ico.definition.role}-permission`;
              definition = `${ico.type} on table "${getTableNameFromDef(
                ico.definition.table
              )}"`;
            } else if (ico.type === 'table') {
              name = getTableNameFromDef(ico.definition);
              definition = name;
            } else if (ico.type === 'function') {
              name = getTableNameFromDef(ico.definition);
              definition = name;
            } else if (ico.type === 'event_trigger') {
              name = ico.definition.configuration.name;
              definition = `event trigger on table "${getTableNameFromDef(
                ico.definition.table
              )}"`;
            } else if (ico.type === 'remote_schema') {
              name = ico.definition.name;
              let url = `"${ico.definition.definition.url ||
                ico.definition.definition.url_from_env
                }"`;
              if (ico.definition.definition.url_from_env) {
                url = `the url from the value of env var ${url}`;
              }
              definition = `remote schema named "${name}" at ${url}`;
            }
            return (
              <tr key={_i}>
                <td>{name}</td>
                <td>{ico.type}</td>
                <td>{definition}</td>
                <td>{ico.reason}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const verifyAndDropAll = () => {
    const confirmMessage =
      'This will drop all the inconsistent objects in your metadata. This action is irreversible.';
    const isOk = getConfirmation(confirmMessage);
    const callback = () => setIsLoading(false);
    if (isOk) {
      setIsLoading(true);
      dispatch(dropInconsistentObjects(callback, callback));
    }
  };

  const content = () => {
    const isInconsistentRemoteSchemaPresent = metadata.inconsistentObjects.some(
      i => i.type === 'remote_schema'
    );
    if (metadata.inconsistentObjects.length === 0) {
      return (
        <div className={styles.add_mar_top}>
          <div className={metaDataStyles.content_width}>
            <div className={styles.display_flex}>
              <CheckIcon className={metaDataStyles.add_mar_right_small} />
              <h4>GraphQL Engine metadata is consistent with database</h4>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.add_mar_top}>
        <div className={metaDataStyles.content_width}>
          <div className={styles.display_flex}>
            <CrossIcon className={metaDataStyles.add_mar_right_small} />
            <h4> GraphQL Engine metadata is inconsistent with database </h4>
          </div>
          <div className={styles.add_mar_top}>
            <div className={styles.add_mar_top_small}>
              <h5>We're sorry that you have experienced this error.</h5>
              <h5>We're working on fixing it as quickly as possible.</h5>
            </div>
            {/* <div className={styles.add_mar_top_small}>
              The GraphQL API has been generated using only the consistent parts
              of the metadata
            </div>
            <div className={styles.add_mar_top_small}>
              The console might also not be able to display these inconsistent
              objects
            </div> */}
          </div>
        </div>
        {/* <div className={styles.add}>{inconsistentObjectsTable()}</div>
        <div
          className={`${metaDataStyles.wd50percent} ${metaDataStyles.add_mar_top}`}
        >
          If you want to manage these objects on your own, please do so and
          click on the "Reload Metadata" button to check if the
          inconsistencies have been resolved
        </div> */}
        {/* <div
          className={`${metaDataStyles.display_flex} ${metaDataStyles.add_mar_top_small}`}
        >
          <Button
            color="red"
            size="sm"
            className={metaDataStyles.add_mar_right}
            onClick={verifyAndDropAll}
            disabled={isLoading}
          >
            Delete all
          </Button>
          <ReloadMetadata
            dispatch={dispatch}
            buttonText="Reload metadata"
            shouldReloadRemoteSchemas={isInconsistentRemoteSchemaPresent}
          />
        </div> */}
      </div>
    );
  };

  const banner = () => {
    if (metadata.inconsistentObjects.length === 0) {
      return null;
    }
    if (!shouldShowErrorBanner) {
      return null;
    }
    const urlSearchParams = new URLSearchParams(window.location.search);
    if (urlSearchParams.get('is_redirected') !== 'true') {
      return null;
    }
    return (
      <div className={`${styles.errorBanner} alert alert-danger`}>
        <i
          className={`${styles.add_mar_right_small} ${styles.fontStyleNormal} fa fa-exclamation-circle`}
          aria-hidden="true"
        />
        <strong>
          You have been redirected because your GraphQL Engine metadata is in an
          inconsistent state
        </strong>
        <i
          className={`${styles.align_right} ${styles.fontStyleNormal} ${styles.cursorPointer} fa fa-times`}
          aria-hidden="true"
          onClick={dismissErrorBanner}
        />
      </div>
    );
  };

  return (
    <div className={styles.add_mar_bottom}>
      {banner()}
      <div
        className={`${styles.clear_fix} ${styles.padd_left} ${styles.padd_top} ${metaDataStyles.metadata_wrapper} container-fluid`}
      >
        <h2 className={styles.headerText}>Pantheon Metadata Status</h2>
        {content()}
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    ...state.main,
    metadata: state.metadata,
    dataHeaders: { ...state.tables.dataHeaders },
  };
};

const connector = connect => connect(mapStateToProps)(MetadataStatus);

export default connector;
